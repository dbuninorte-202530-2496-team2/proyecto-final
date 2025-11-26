-- =====================================================
-- STORED PROCEDURES: GESTIÓN DE ASIGNACIONES
-- =====================================================

-- Procedure: Asignar tutor a un aula
CREATE OR REPLACE PROCEDURE sp_asignar_tutor_aula(
    p_id_aula INT,
    p_id_tutor INT,
    p_fecha_asignado DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql AS $$
DECLARE
    v_consec INT;
    v_tutor_actual INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM aula WHERE id = p_id_aula) THEN
        RAISE EXCEPTION 'El aula con id % no existe', p_id_aula;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM personal p
        INNER JOIN rol r ON p.id_rol = r.id
        WHERE p.id = p_id_tutor AND r.nombre IN ('TUTOR')
    ) THEN
        RAISE EXCEPTION 'El tutor con id % no existe o no tiene el rol adecuado', p_id_tutor;
    END IF;
    
    v_tutor_actual := fn_obtener_tutor_actual_aula(p_id_aula);
    
    IF v_tutor_actual IS NOT NULL THEN
        RAISE EXCEPTION 'El aula ya tiene un tutor asignado (id: %). Use sp_cambiar_tutor_aula para cambiarlo', v_tutor_actual;
    END IF;
    
    SELECT COALESCE(MAX(consec), 0) + 1 INTO v_consec
    FROM tutor_aula
    WHERE id_aula = p_id_aula AND id_tutor = p_id_tutor;
    
    INSERT INTO tutor_aula (id_tutor, id_aula, consec, fecha_asignado, fecha_desasignado)
    VALUES (p_id_tutor, p_id_aula, v_consec, p_fecha_asignado, NULL);
    
    RAISE NOTICE 'Tutor % asignado al aula % exitosamente', p_id_tutor, p_id_aula;
END;
$$;

-- Procedure: Cambiar tutor de un aula (mantiene historial)
CREATE OR REPLACE PROCEDURE sp_cambiar_tutor_aula(
    p_id_aula INT,
    p_id_tutor_nuevo INT,
    p_fecha_cambio DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql AS $$
DECLARE
    v_tutor_actual INT;
    v_consec INT;
BEGIN
    v_tutor_actual := fn_obtener_tutor_actual_aula(p_id_aula);
    
    IF v_tutor_actual IS NULL THEN
        RAISE EXCEPTION 'El aula % no tiene un tutor asignado actualmente', p_id_aula;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM personal p
        INNER JOIN rol r ON p.id_rol = r.id
        WHERE p.id = p_id_tutor_nuevo AND r.nombre IN ('TUTOR')
    ) THEN
        RAISE EXCEPTION 'El tutor con id % no existe o no tiene el rol adecuado', p_id_tutor_nuevo;
    END IF;
    
    UPDATE tutor_aula
    SET fecha_desasignado = p_fecha_cambio
    WHERE id_aula = p_id_aula 
      AND id_tutor = v_tutor_actual 
      AND fecha_desasignado IS NULL;
    
    SELECT COALESCE(MAX(consec), 0) + 1 INTO v_consec
    FROM tutor_aula
    WHERE id_aula = p_id_aula AND id_tutor = p_id_tutor_nuevo;
    
    INSERT INTO tutor_aula (id_tutor, id_aula, consec, fecha_asignado, fecha_desasignado)
    VALUES (p_id_tutor_nuevo, p_id_aula, v_consec, p_fecha_cambio, NULL);
    
    RAISE NOTICE 'Tutor cambiado de % a % para el aula %', v_tutor_actual, p_id_tutor_nuevo, p_id_aula;
END;
$$;

-- Procedure: Asignar estudiante a un aula
CREATE OR REPLACE PROCEDURE sp_asignar_estudiante_aula(
    p_id_estudiante INT,
    p_id_aula INT,
    p_fecha_asignado DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql AS $$
DECLARE
    v_consec INT;
    v_aula_actual INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM estudiante WHERE id = p_id_estudiante) THEN
        RAISE EXCEPTION 'El estudiante con id % no existe', p_id_estudiante;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM aula WHERE id = p_id_aula) THEN
        RAISE EXCEPTION 'El aula con id % no existe', p_id_aula;
    END IF;
    
    v_aula_actual := fn_obtener_aula_actual_estudiante(p_id_estudiante);
    
    IF v_aula_actual IS NOT NULL THEN
        RAISE EXCEPTION 'El estudiante ya tiene un aula asignada (id: %). Use sp_mover_estudiante_aula para moverlo', v_aula_actual;
    END IF;
    
    SELECT COALESCE(MAX(consec), 0) + 1 INTO v_consec
    FROM estudiante_aula
    WHERE id_estudiante = p_id_estudiante AND id_aula = p_id_aula;
    
    INSERT INTO estudiante_aula (id_estudiante, id_aula, consec, fecha_asignado, fecha_desasignado)
    VALUES (p_id_estudiante, p_id_aula, v_consec, p_fecha_asignado, NULL);
    
    RAISE NOTICE 'Estudiante % asignado al aula % exitosamente', p_id_estudiante, p_id_aula;
END;
$$;

-- Procedure: Mover estudiante entre aulas (validando grados compatibles)
CREATE OR REPLACE PROCEDURE sp_mover_estudiante_aula(
    p_id_estudiante INT,
    p_id_aula_destino INT,
    p_fecha_movimiento DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_aula_origen INT;
    v_grado_origen INT;
    v_grado_destino INT;
    v_consec INT;
BEGIN
    v_id_aula_origen := fn_obtener_aula_actual_estudiante(p_id_estudiante);
    
    IF v_id_aula_origen IS NULL THEN
        RAISE EXCEPTION 'El estudiante % no tiene un aula asignada actualmente', p_id_estudiante;
    END IF;
    
    IF v_id_aula_origen = p_id_aula_destino THEN
        RAISE EXCEPTION 'El estudiante ya está en el aula destino';
    END IF;
    
    v_grado_origen := fn_obtener_grado_aula(v_id_aula_origen);
    v_grado_destino := fn_obtener_grado_aula(p_id_aula_destino);
    
    IF NOT fn_validar_compatibilidad_grados(v_grado_origen, v_grado_destino) THEN
        RAISE EXCEPTION 'No se puede mover estudiante de grado % a grado %. Solo se permite 4º-5º o 9º-10º', 
            v_grado_origen, v_grado_destino;
    END IF;
    
    UPDATE estudiante_aula
    SET fecha_desasignado = p_fecha_movimiento
    WHERE id_estudiante = p_id_estudiante 
      AND id_aula = v_id_aula_origen
      AND fecha_desasignado IS NULL;
    
    SELECT COALESCE(MAX(consec), 0) + 1 INTO v_consec
    FROM estudiante_aula
    WHERE id_estudiante = p_id_estudiante AND id_aula = p_id_aula_destino;
    
    INSERT INTO estudiante_aula (id_estudiante, id_aula, consec, fecha_asignado, fecha_desasignado)
    VALUES (p_id_estudiante, p_id_aula_destino, v_consec, p_fecha_movimiento, NULL);
    
    RAISE NOTICE 'Estudiante % movido del aula % (grado %º) al aula % (grado %º)', 
        p_id_estudiante, v_id_aula_origen, v_grado_origen, p_id_aula_destino, v_grado_destino;
END;
$$;

-- Procedure: Asignar horario a un aula en una semana específica
CREATE OR REPLACE PROCEDURE sp_asignar_horario_aula_semana(
    p_id_aula INT,
    p_id_horario INT,
    p_id_semana INT
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM aula WHERE id = p_id_aula) THEN
        RAISE EXCEPTION 'El aula con id % no existe', p_id_aula;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM horario WHERE id = p_id_horario) THEN
        RAISE EXCEPTION 'El horario con id % no existe', p_id_horario;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM semana WHERE id = p_id_semana) THEN
        RAISE EXCEPTION 'La semana con id % no existe', p_id_semana;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM aula_horario_sem 
        WHERE id_aula = p_id_aula AND id_horario = p_id_horario AND id_semana = p_id_semana
    ) THEN
        RAISE EXCEPTION 'El horario % ya está asignado al aula % en la semana %', 
            p_id_horario, p_id_aula, p_id_semana;
    END IF;
    
    INSERT INTO aula_horario_sem (id_aula, id_horario, id_semana)
    VALUES (p_id_aula, p_id_horario, p_id_semana);
    
    RAISE NOTICE 'Horario % asignado al aula % para la semana %', p_id_horario, p_id_aula, p_id_semana;
END;
$$;

-- Procedure: Asignar horario a un aula para todo un periodo
CREATE OR REPLACE PROCEDURE sp_asignar_horario_aula_periodo(
    p_id_aula INT,
    p_id_horario INT,
    p_id_periodo INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_semana RECORD;
    v_contador INT := 0;
BEGIN
    FOR v_semana IN 
        SELECT id FROM semana WHERE id_periodo = p_id_periodo ORDER BY fec_ini
    LOOP
        BEGIN
            INSERT INTO aula_horario_sem (id_aula, id_horario, id_semana)
            VALUES (p_id_aula, p_id_horario, v_semana.id)
            ON CONFLICT DO NOTHING;
            
            v_contador := v_contador + 1;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'No se pudo asignar horario % a aula % en semana %', 
                p_id_horario, p_id_aula, v_semana.id;
        END;
    END LOOP;
    
    RAISE NOTICE 'Horario % asignado al aula % en % semanas del periodo %', 
        p_id_horario, p_id_aula, v_contador, p_id_periodo;
END;
$$;