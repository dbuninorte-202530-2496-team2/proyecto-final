-- =====================================================
-- STORED PROCEDURES: FUNCIONES ADMINISTRATIVAS
-- =====================================================

-- Procedure: Crear institución con sede principal
CREATE OR REPLACE PROCEDURE sp_crear_institucion(
    p_id_institucion INT,
    p_nombre_institucion TEXT,
    p_correo TEXT,
    p_jornada TEXT,
    p_nombre_contacto TEXT,
    p_telefono_contacto VARCHAR,
    p_id_sede INT,
    p_nombre_sede TEXT,
    p_direccion_sede TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_jornada NOT IN ('MAÑANA', 'TARDE', 'ÚNICA') THEN
        RAISE EXCEPTION 'Jornada inválida. Use: MAÑANA, TARDE o ÚNICA';
    END IF;
    
    INSERT INTO institucion (id, nombre, correo, jornada, nombre_contacto, telefono_contacto)
    VALUES (p_id_institucion, p_nombre_institucion, p_correo, p_jornada, p_nombre_contacto, p_telefono_contacto);
    
    INSERT INTO sede (id, nombre, direccion, id_inst, is_principal)
    VALUES (p_id_sede, p_nombre_sede, p_direccion_sede, p_id_institucion, TRUE);
    
    RAISE NOTICE 'Institución % creada con sede principal %', p_nombre_institucion, p_nombre_sede;
END;
$$;

-- Procedure: Agregar sede adicional a una institución
CREATE OR REPLACE PROCEDURE sp_agregar_sede(
    p_id_sede INT,
    p_nombre TEXT,
    p_direccion TEXT,
    p_id_institucion INT
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM institucion WHERE id = p_id_institucion) THEN
        RAISE EXCEPTION 'La institución % no existe', p_id_institucion;
    END IF;
    
    INSERT INTO sede (id, nombre, direccion, id_inst, is_principal)
    VALUES (p_id_sede, p_nombre, p_direccion, p_id_institucion, FALSE);
    
    RAISE NOTICE 'Sede % agregada a la institución', p_nombre;
END;
$$;

-- Procedure: Crear aula
CREATE OR REPLACE PROCEDURE sp_crear_aula(
    p_id_aula INT,
    p_grado INT,
    p_grupo INT,
    p_id_sede INT
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_grado NOT IN (4, 5, 9, 10) THEN
        RAISE EXCEPTION 'Grado inválido. Solo se permiten grados 4, 5, 9 y 10';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM sede WHERE id = p_id_sede) THEN
        RAISE EXCEPTION 'La sede % no existe', p_id_sede;
    END IF;
    
    INSERT INTO aula (id, grado, grupo, id_sede)
    VALUES (p_id_aula, p_grado, p_grupo, p_id_sede);
    
    RAISE NOTICE 'Aula creada: Grado %º Grupo % en sede %', p_grado, p_grupo, p_id_sede;
END;
$$;

-- Procedure: Contratar personal
CREATE OR REPLACE PROCEDURE sp_contratar_personal(
    p_codigo VARCHAR,
    p_nombre TEXT,
    p_apellido TEXT,
    p_correo TEXT,
    p_telefono VARCHAR,
    p_id_rol INT,
    p_usuario TEXT,
    p_contrasena TEXT,
    p_tipo_doc INT
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM rol WHERE id = p_id_rol) THEN
        RAISE EXCEPTION 'El rol % no existe', p_id_rol;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM tipoDocumento WHERE id = p_tipo_doc) THEN
        RAISE EXCEPTION 'El tipo de documento % no existe', p_tipo_doc;
    END IF;
    
    INSERT INTO usuario (usuario, contrasena)
    VALUES (p_usuario, p_contrasena);
    
    INSERT INTO personal (codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc)
    VALUES (p_codigo, p_nombre, p_apellido, p_correo, p_telefono, p_id_rol, p_usuario, p_tipo_doc);
    
    RAISE NOTICE 'Personal % % contratado con usuario %', p_nombre, p_apellido, p_usuario;
END;
$$;

-- Procedure: Inscribir estudiante
CREATE OR REPLACE PROCEDURE sp_inscribir_estudiante(
    p_codigo VARCHAR,
    p_nombre TEXT,
    p_apellidos TEXT,
    p_id_aula INT,
    p_tipo_doc INT,
    p_score_in NUMERIC DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_estudiante INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM aula WHERE id = p_id_aula) THEN
        RAISE EXCEPTION 'El aula % no existe', p_id_aula;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM tipoDocumento WHERE id = p_tipo_doc) THEN
        RAISE EXCEPTION 'El tipo de documento % no existe', p_tipo_doc;
    END IF;
    
    INSERT INTO estudiante (codigo, nombre, apellidos, score_in, score_out, tipo_doc)
    VALUES (p_codigo, p_nombre, p_apellidos, p_score_in, NULL, p_tipo_doc)
    RETURNING id INTO v_id_estudiante;
    
    CALL sp_asignar_estudiante_aula(v_id_estudiante, p_id_aula, CURRENT_DATE);
    
    RAISE NOTICE 'Estudiante % % inscrito con código % (ID: %) en aula %', 
        p_nombre, p_apellidos, p_codigo, v_id_estudiante, p_id_aula;
END;
$$;

-- Procedure: Actualizar score de salida de estudiante
CREATE OR REPLACE PROCEDURE sp_actualizar_score_salida(
    p_id_estudiante INT,
    p_score_out NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM estudiante WHERE id = p_id_estudiante) THEN
        RAISE EXCEPTION 'El estudiante % no existe', p_id_estudiante;
    END IF;
    
    UPDATE estudiante
    SET score_out = p_score_out
    WHERE id = p_id_estudiante;
    
    RAISE NOTICE 'Score de salida actualizado para estudiante %: %', p_id_estudiante, p_score_out;
END;
$$;

-- Procedure: Crear periodo
CREATE OR REPLACE PROCEDURE sp_crear_periodo(
    p_anho INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_periodo INT;
BEGIN
    IF EXISTS (SELECT 1 FROM periodo WHERE anho = p_anho) THEN
        RAISE EXCEPTION 'Ya existe un periodo para el año %', p_anho;
    END IF;
    
    INSERT INTO periodo (anho)
    VALUES (p_anho)
    RETURNING id INTO v_id_periodo;
    
    RAISE NOTICE 'Periodo % creado con ID %', p_anho, v_id_periodo;
END;
$$;

-- Procedure: Crear motivo de inasistencia
CREATE OR REPLACE PROCEDURE sp_crear_motivo(
    p_descripcion TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_motivo INT;
BEGIN
    INSERT INTO motivo (descripcion)
    VALUES (p_descripcion)
    RETURNING id INTO v_id_motivo;
    
    RAISE NOTICE 'Motivo creado con ID %: %', v_id_motivo, p_descripcion;
END;
$$;

-- Procedure: Crear horario
CREATE OR REPLACE PROCEDURE sp_crear_horario(
    p_id_horario INT,
    p_dia_sem CHAR(2),
    p_hora_ini TIME,
    p_hora_fin TIME
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_dia_sem NOT IN ('LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO') THEN
        RAISE EXCEPTION 'Día de semana inválido. Use: LU, MA, MI, JU, VI, SA, DO';
    END IF;
    
    IF p_hora_fin <= p_hora_ini THEN
        RAISE EXCEPTION 'La hora fin debe ser posterior a la hora inicio';
    END IF;
    
    INSERT INTO horario (id, dia_sem, hora_ini, hora_fin)
    VALUES (p_id_horario, p_dia_sem, p_hora_ini, p_hora_fin);
    
    RAISE NOTICE 'Horario creado con ID %: % de % a %', 
        p_id_horario, p_dia_sem, p_hora_ini, p_hora_fin;
END;
$$;

-- Function: Listar aulas de una institución
CREATE OR REPLACE FUNCTION fn_listar_aulas_institucion(
    p_id_institucion INT
)
RETURNS TABLE (
    aula_id INT,
    grado INT,
    grupo INT,
    sede_nombre TEXT,
    sede_direccion TEXT,
    es_sede_principal BOOLEAN,
    tutor_actual TEXT,
    id_tutor INT,
    cantidad_estudiantes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as aula_id,
        a.grado,
        a.grupo,
        s.nombre as sede_nombre,
        s.direccion as sede_direccion,
        s.is_principal as es_sede_principal,
        (p.nombre || ' ' || COALESCE(p.apellido, '')) as tutor_actual,
        p.id as id_tutor,
        COUNT(ea.id_estudiante) as cantidad_estudiantes
    FROM aula a
    INNER JOIN sede s ON a.id_sede = s.id
    LEFT JOIN LATERAL (
        SELECT id_tutor 
        FROM tutor_aula 
        WHERE id_aula = a.id 
          AND fecha_desasignado IS NULL
        LIMIT 1
    ) ta ON true
    LEFT JOIN personal p ON ta.id_tutor = p.id
    LEFT JOIN estudiante_aula ea ON ea.id_aula = a.id AND ea.fecha_desasignado IS NULL
    WHERE s.id_inst = p_id_institucion
    GROUP BY a.id, a.grado, a.grupo, s.nombre, s.direccion, s.is_principal, p.nombre, p.apellido, p.id
    ORDER BY a.grado, a.grupo;
END;
$$ LANGUAGE plpgsql STABLE;