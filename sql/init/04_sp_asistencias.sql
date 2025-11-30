-- =====================================================
-- STORED PROCEDURES: GESTIÓN DE ASISTENCIAS
-- =====================================================

-- Procedure: Registrar asistencia de estudiante (VALIDADA CONTRA ASISTENCIA TUTOR)
CREATE OR REPLACE PROCEDURE sp_registrar_asistencia_estudiante(
    p_id_estudiante INT,
    p_id_aula INT,
    p_id_horario INT,
    p_fecha_real DATE,
    p_presente BOOLEAN
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_semana INT;
    v_asistencia_tutor RECORD;
    v_aula_estudiante INT;
BEGIN
    -- Validar estudiante en aula
    v_aula_estudiante := fn_obtener_aula_actual_estudiante(p_id_estudiante);
    IF v_aula_estudiante IS NULL OR v_aula_estudiante != p_id_aula THEN
        RAISE EXCEPTION 'El estudiante % no pertenece al aula %', p_id_estudiante, p_id_aula;
    END IF;

    v_id_semana := fn_obtener_semana_por_fecha(p_fecha_real);
    IF v_id_semana IS NULL THEN
        RAISE EXCEPTION 'Fecha % no pertenece a ninguna semana válida', p_fecha_real;
    END IF;

    -- Obtener registro del tutor
    SELECT *
    INTO v_asistencia_tutor
    FROM asistenciaTut
    WHERE id_aula = p_id_aula
      AND id_horario = p_id_horario
      AND fecha_real = p_fecha_real
    LIMIT 1;

    -- Debe existir asistenciaTutor
    IF v_asistencia_tutor IS NULL THEN
        RAISE EXCEPTION 'No existe asistencia del tutor para aula %, horario %, fecha %',
            p_id_aula, p_id_horario, p_fecha_real;
    END IF;

    -- Validar que la clase haya sido dictada O tenga reposición programada
    IF NOT v_asistencia_tutor.dictoClase AND v_asistencia_tutor.fecha_reposicion IS NULL THEN
        RAISE EXCEPTION 'No se puede registrar asistencia: el tutor no dictó la clase y no hay fecha de reposición programada.';
    END IF;

    -- Registrar asistencia estudiante
    INSERT INTO asistenciaEst (
        fecha_real, presente, id_estudiante, id_aula, id_horario, id_semana
    ) VALUES (
        p_fecha_real, p_presente, p_id_estudiante, p_id_aula, p_id_horario, v_id_semana
    )
    ON CONFLICT (id_estudiante, id_aula, id_horario, fecha_real)
    DO UPDATE SET presente = EXCLUDED.presente;
END;
$$;

-- Procedure: Registrar asistencia de tutor (mejorada)
CREATE OR REPLACE PROCEDURE sp_registrar_asistencia_tutor(
    p_id_tutor INT,
    p_id_aula INT,
    p_id_horario INT,
    p_fecha_real DATE,
    p_dicto_clase BOOLEAN,
    p_id_motivo INT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_semana INT;
    v_tutor_actual INT;
    v_es_festivo BOOLEAN;
BEGIN
    -- Verificar tutor asignado
    v_tutor_actual := fn_obtener_tutor_actual_aula(p_id_aula);
    IF v_tutor_actual IS NULL THEN
        RAISE EXCEPTION 'El aula % no tiene tutor asignado', p_id_aula;
    END IF;

    -- Validar que el tutor sea el actual
    IF v_tutor_actual != p_id_tutor THEN
        RAISE WARNING 'El tutor % no es el tutor actual del aula %. Se registrará igual por ser administrativo.',
            p_id_tutor, p_id_aula;
    END IF;

    -- Obtener semana
    v_id_semana := fn_obtener_semana_por_fecha(p_fecha_real);
    IF v_id_semana IS NULL THEN
        RAISE EXCEPTION 'La fecha % no pertenece a ninguna semana válida', p_fecha_real;
    END IF;

    -- Validar horario está asignado al aula esa semana
    IF NOT fn_horario_pertenece_aula_semana(p_id_aula, p_id_horario, v_id_semana) THEN
        RAISE EXCEPTION 'El horario % no está asignado al aula % en la semana %',
            p_id_horario, p_id_aula, v_id_semana;
    END IF;

    -- Validar festivo
    v_es_festivo := fn_es_festivo(p_fecha_real);

    IF v_es_festivo AND p_dicto_clase THEN
        RAISE WARNING 'La fecha % es festivo. Se registra clase dictada bajo advertencia.', p_fecha_real;
    END IF;

    IF NOT p_dicto_clase AND p_id_motivo IS NULL AND NOT v_es_festivo THEN
        RAISE EXCEPTION 'Debe proporcionar un motivo si no dictó la clase y no es festivo.';
    END IF;

    -- Registrar o actualizar asistencia
    INSERT INTO asistenciaTut (
        fecha_real, dictoClase, id_tutor, id_aula, id_horario, id_semana, id_motivo, fecha_reposicion
    ) VALUES (
        p_fecha_real, p_dicto_clase, p_id_tutor, p_id_aula, p_id_horario, v_id_semana, p_id_motivo, NULL
    )
    ON CONFLICT (id_tutor, id_aula, id_horario, fecha_real)
    DO UPDATE SET
        dictoClase = EXCLUDED.dictoClase,
        id_motivo = EXCLUDED.id_motivo;

END;
$$;

-- Procedure: Registrar asistencias masivas de estudiantes de un aula (validada)
CREATE OR REPLACE PROCEDURE sp_registrar_asistencia_aula_masiva(
    p_id_aula INT,
    p_id_horario INT,
    p_fecha_real DATE,
    p_estudiantes_presentes INT[] DEFAULT ARRAY[]::INT[]
)
LANGUAGE plpgsql AS $$
DECLARE
    v_tutor_asistencia RECORD;
    v_est RECORD;
    v_presente BOOLEAN;
BEGIN
    -- Validar que exista asistencia del tutor
    SELECT *
    INTO v_tutor_asistencia
    FROM asistenciaTut
    WHERE id_aula = p_id_aula
      AND id_horario = p_id_horario
      AND fecha_real = p_fecha_real
    LIMIT 1;

    IF v_tutor_asistencia IS NULL THEN
        RAISE EXCEPTION 'Primero debe registrar la asistencia del tutor para el aula %, horario %, fecha %',
            p_id_aula, p_id_horario, p_fecha_real;
    END IF;

    IF NOT v_tutor_asistencia.dictoClase AND v_tutor_asistencia.fecha_reposicion IS NULL THEN
        RAISE EXCEPTION 'No se puede registrar asistencia masiva: el tutor no dictó la clase y no hay fecha de reposición programada.';
    END IF;

    -- Recorrer estudiantes del aula
    FOR v_est IN
        SELECT id_estudiante
        FROM estudiante_aula
        WHERE id_aula = p_id_aula
          AND fecha_desasignado IS NULL
    LOOP
        v_presente := (v_est.id_estudiante = ANY(p_estudiantes_presentes));

        CALL sp_registrar_asistencia_estudiante(
            v_est.id_estudiante,
            p_id_aula,
            p_id_horario,
            p_fecha_real,
            v_presente
        );
    END LOOP;
END;
$$;

-- Function: Obtener estudiantes ausentes en una fecha
CREATE OR REPLACE FUNCTION fn_obtener_estudiantes_ausentes(
    p_id_aula INT,
    p_fecha_real DATE
)
RETURNS TABLE (
    id_estudiante INT,
    nombre_completo TEXT,
    cantidad_ausencias BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.nombre || ' ' || e.apellidos as nombre_completo,
        COUNT(*) FILTER (WHERE ae.presente = FALSE) as cantidad_ausencias
    FROM estudiante e
    INNER JOIN estudiante_aula ea ON e.id = ea.id_estudiante
    LEFT JOIN asistenciaEst ae ON ae.id_estudiante = e.id
    WHERE ea.id_aula = p_id_aula
      AND ea.fecha_desasignado IS NULL
      AND (ae.fecha_real = p_fecha_real OR ae.fecha_real IS NULL)
    GROUP BY e.id, e.nombre, e.apellidos
    HAVING COUNT(*) FILTER (WHERE ae.presente = FALSE AND ae.fecha_real = p_fecha_real) > 0
    ORDER BY e.apellidos, e.nombre;
END;
$$ LANGUAGE plpgsql STABLE;
