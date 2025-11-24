-- =====================================================
-- STORED PROCEDURES: GESTIÓN DE ASISTENCIAS
-- =====================================================

-- Procedure: Registrar asistencia de estudiante
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
    v_aula_estudiante INT;
BEGIN
    v_aula_estudiante := fn_obtener_aula_actual_estudiante(p_id_estudiante);
    
    IF v_aula_estudiante IS NULL THEN
        RAISE EXCEPTION 'El estudiante % no existe o no tiene aula asignada', p_id_estudiante;
    END IF;
    
    IF v_aula_estudiante != p_id_aula THEN
        RAISE EXCEPTION 'El estudiante % no pertenece al aula %', p_id_estudiante, p_id_aula;
    END IF;
    
    v_id_semana := fn_obtener_semana_por_fecha(p_fecha_real);
    
    IF v_id_semana IS NOT NULL AND 
       NOT fn_horario_pertenece_aula_semana(p_id_aula, p_id_horario, v_id_semana) THEN
        RAISE EXCEPTION 'El horario % no está asignado al aula % en la semana %', 
            p_id_horario, p_id_aula, v_id_semana;
    END IF;
    
    INSERT INTO asistenciaEst (
        fecha_real, presente, id_estudiante, id_aula, id_horario, id_semana
    ) VALUES (
        p_fecha_real, p_presente, p_id_estudiante, p_id_aula, p_id_horario, v_id_semana
    )
    ON CONFLICT (id_estudiante, id_aula, id_horario, fecha_real)
    DO UPDATE SET presente = p_presente;
    
    RAISE NOTICE 'Asistencia registrada para estudiante % en fecha %: %', 
        p_id_estudiante, p_fecha_real, CASE WHEN p_presente THEN 'PRESENTE' ELSE 'AUSENTE' END;
END;
$$;

-- Procedure: Registrar asistencia de tutor
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
    v_tutor_actual := fn_obtener_tutor_actual_aula(p_id_aula);
    
    IF v_tutor_actual IS NULL THEN
        RAISE EXCEPTION 'El aula % no tiene un tutor asignado', p_id_aula;
    END IF;
    
    IF v_tutor_actual != p_id_tutor THEN
        RAISE WARNING 'El tutor % no es el tutor actual del aula % (tutor actual: %)', 
            p_id_tutor, p_id_aula, v_tutor_actual;
    END IF;
    
    v_id_semana := fn_obtener_semana_por_fecha(p_fecha_real);
    
    IF v_id_semana IS NOT NULL AND 
       NOT fn_horario_pertenece_aula_semana(p_id_aula, p_id_horario, v_id_semana) THEN
        RAISE EXCEPTION 'El horario % no está asignado al aula % en la semana %', 
            p_id_horario, p_id_aula, v_id_semana;
    END IF;
    
    v_es_festivo := fn_es_festivo(p_fecha_real);
    
    IF v_es_festivo AND p_dicto_clase THEN
        RAISE WARNING 'La fecha % es festivo. ¿Está seguro de marcar que dictó clase?', p_fecha_real;
    END IF;
    
    IF NOT p_dicto_clase AND p_id_motivo IS NULL AND NOT v_es_festivo THEN
        RAISE EXCEPTION 'Debe proporcionar un motivo para no dictar la clase';
    END IF;
    
    INSERT INTO asistenciaTut (
        fecha_real, dictoClase, id_tutor, id_aula, id_horario, id_semana, id_motivo, fecha_reposicion
    ) VALUES (
        p_fecha_real, p_dicto_clase, p_id_tutor, p_id_aula, p_id_horario, v_id_semana, p_id_motivo, NULL
    )
    ON CONFLICT (id_tutor, id_aula, id_horario, fecha_real)
    DO UPDATE SET 
        dictoClase = p_dicto_clase,
        id_motivo = p_id_motivo;
    
    RAISE NOTICE 'Asistencia registrada para tutor % en fecha %: %', 
        p_id_tutor, p_fecha_real, CASE WHEN p_dicto_clase THEN 'DICTÓ CLASE' ELSE 'NO DICTÓ CLASE' END;
END;
$$;

-- Procedure: Registrar fecha de reposición de clase
CREATE OR REPLACE PROCEDURE sp_registrar_reposicion_clase(
    p_id_asistencia_tutor INT,
    p_fecha_reposicion DATE
)
LANGUAGE plpgsql AS $$
DECLARE
    v_dicto_clase BOOLEAN;
BEGIN
    SELECT dictoClase INTO v_dicto_clase
    FROM asistenciaTut
    WHERE id = p_id_asistencia_tutor;
    
    IF v_dicto_clase IS NULL THEN
        RAISE EXCEPTION 'La asistencia con id % no existe', p_id_asistencia_tutor;
    END IF;
    
    IF v_dicto_clase THEN
        RAISE EXCEPTION 'No se puede registrar reposición para una clase que sí se dictó';
    END IF;
    
    UPDATE asistenciaTut
    SET fecha_reposicion = p_fecha_reposicion
    WHERE id = p_id_asistencia_tutor;
    
    RAISE NOTICE 'Fecha de reposición % registrada para la asistencia %', 
        p_fecha_reposicion, p_id_asistencia_tutor;
END;
$$;

-- Procedure: Registrar asistencias masivas de estudiantes de un aula
CREATE OR REPLACE PROCEDURE sp_registrar_asistencia_aula_masiva(
    p_id_aula INT,
    p_id_horario INT,
    p_fecha_real DATE,
    p_estudiantes_presentes INT[] DEFAULT ARRAY[]::INT[]
)
LANGUAGE plpgsql AS $$
DECLARE
    v_estudiante RECORD;
    v_presente BOOLEAN;
BEGIN
    FOR v_estudiante IN 
        SELECT ea.id_estudiante 
        FROM estudiante_aula ea
        WHERE ea.id_aula = p_id_aula 
          AND ea.fecha_desasignado IS NULL
    LOOP
        v_presente := v_estudiante.id_estudiante = ANY(p_estudiantes_presentes);
        
        CALL sp_registrar_asistencia_estudiante(
            v_estudiante.id_estudiante,
            p_id_aula,
            p_id_horario,
            p_fecha_real,
            v_presente
        );
    END LOOP;
    
    RAISE NOTICE 'Asistencia masiva registrada para aula % en fecha %', p_id_aula, p_fecha_real;
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

-- Procedure: Marcar todos como presentes (útil cuando casi todos asistieron)
CREATE OR REPLACE PROCEDURE sp_marcar_todos_presentes(
    p_id_aula INT,
    p_id_horario INT,
    p_fecha_real DATE,
    p_estudiantes_ausentes INT[] DEFAULT ARRAY[]::INT[]
)
LANGUAGE plpgsql AS $$
DECLARE
    v_estudiante RECORD;
    v_presente BOOLEAN;
BEGIN
    FOR v_estudiante IN 
        SELECT ea.id_estudiante 
        FROM estudiante_aula ea
        WHERE ea.id_aula = p_id_aula 
          AND ea.fecha_desasignado IS NULL
    LOOP
        v_presente := NOT (v_estudiante.id_estudiante = ANY(p_estudiantes_ausentes));
        
        CALL sp_registrar_asistencia_estudiante(
            v_estudiante.id_estudiante,
            p_id_aula,
            p_id_horario,
            p_fecha_real,
            v_presente
        );
    END LOOP;
    
    RAISE NOTICE 'Asistencia registrada (todos presentes excepto %) para aula % en fecha %', 
        array_length(p_estudiantes_ausentes, 1), p_id_aula, p_fecha_real;
END;
$$;