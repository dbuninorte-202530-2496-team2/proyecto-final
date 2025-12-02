-- =====================================================
-- STORED PROCEDURES: REPORTES
-- =====================================================

-- Function: Reporte de asistencia de un aula
CREATE OR REPLACE FUNCTION fn_reporte_asistencia_aula(
    p_id_aula INT,
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    semana_numero INT,
    fecha_inicio_semana DATE,
    fecha_fin_semana DATE,
    tutor_nombre TEXT,
    tutor_id INT,
    fecha_real DATE,
    es_festivo BOOLEAN,
    dia_semana TEXT,
    hora_inicio TIME,
    hora_fin TIME,
    clase_dictada BOOLEAN,
    horas_dictadas NUMERIC,
    horas_no_dictadas NUMERIC,
    motivo_inasistencia TEXT,
    hubo_reposicion BOOLEAN,
    fecha_reposicion DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as semana_numero,
        s.fec_ini as fecha_inicio_semana,
        s.fec_fin as fecha_fin_semana,
        (p.nombre || ' ' || COALESCE(p.apellido, '')) as tutor_nombre,
        p.id as tutor_id,
        at.fecha_real,
        fn_es_festivo(at.fecha_real) as es_festivo,
        CASE EXTRACT(DOW FROM at.fecha_real)
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Lunes'
            WHEN 2 THEN 'Martes'
            WHEN 3 THEN 'Miércoles'
            WHEN 4 THEN 'Jueves'
            WHEN 5 THEN 'Viernes'
            WHEN 6 THEN 'Sábado'
        END as dia_semana,
        h.hora_ini as hora_inicio,
        h.hora_fin as hora_fin,
        at.dictoClase as clase_dictada,
        CASE WHEN at.dictoClase THEN 
            EXTRACT(EPOCH FROM (h.hora_fin - h.hora_ini)) / 3600 
        ELSE 0 END as horas_dictadas,
        CASE WHEN NOT at.dictoClase THEN 
            EXTRACT(EPOCH FROM (h.hora_fin - h.hora_ini)) / 3600 
        ELSE 0 END as horas_no_dictadas,
        m.descripcion as motivo_inasistencia,
        (at.fecha_reposicion IS NOT NULL) as hubo_reposicion,
        at.fecha_reposicion
    FROM asistenciaTut at
    INNER JOIN semana s ON at.id_semana = s.id
    INNER JOIN personal p ON at.id_tutor = p.id
    INNER JOIN horario h ON at.id_horario = h.id
    LEFT JOIN motivo m ON at.id_motivo = m.id
    WHERE at.id_aula = p_id_aula
      AND (p_fecha_inicio IS NULL OR at.fecha_real >= p_fecha_inicio)
      AND (p_fecha_fin IS NULL OR at.fecha_real <= p_fecha_fin)
    ORDER BY at.fecha_real, h.hora_ini;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Reporte de asistencia de un estudiante
CREATE OR REPLACE FUNCTION fn_reporte_asistencia_estudiante(
    p_id_estudiante INT,
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    estudiante_nombre TEXT,
    aula_grado INT,
    aula_grupo INT,
    semana_numero INT,
    fecha_real DATE,
    es_festivo BOOLEAN,
    dia_semana TEXT,
    hora_inicio TIME,
    hora_fin TIME,
    presente BOOLEAN,
    tutor_nombre TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (e.nombre || ' ' || e.apellidos) as estudiante_nombre,
        a.grado as aula_grado,
        a.grupo as aula_grupo,
        s.id as semana_numero,
        ae.fecha_real,
        fn_es_festivo(ae.fecha_real) as es_festivo,
        CASE EXTRACT(DOW FROM ae.fecha_real)
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Lunes'
            WHEN 2 THEN 'Martes'
            WHEN 3 THEN 'Miércoles'
            WHEN 4 THEN 'Jueves'
            WHEN 5 THEN 'Viernes'
            WHEN 6 THEN 'Sábado'
        END as dia_semana,
        h.hora_ini as hora_inicio,
        h.hora_fin as hora_fin,
        ae.presente,
        (p.nombre || ' ' || COALESCE(p.apellido, '')) as tutor_nombre
    FROM asistenciaEst ae
    INNER JOIN estudiante e ON ae.id_estudiante = e.id
    INNER JOIN aula a ON ae.id_aula = a.id
    INNER JOIN semana s ON ae.id_semana = s.id
    INNER JOIN horario h ON ae.id_horario = h.id
    LEFT JOIN LATERAL (
        SELECT id_tutor 
        FROM tutor_aula 
        WHERE id_aula = ae.id_aula 
          AND fecha_desasignado IS NULL
        LIMIT 1
    ) ta ON true
    LEFT JOIN personal p ON ta.id_tutor = p.id
    WHERE ae.id_estudiante = p_id_estudiante
      AND (p_fecha_inicio IS NULL OR ae.fecha_real >= p_fecha_inicio)
      AND (p_fecha_fin IS NULL OR ae.fecha_real <= p_fecha_fin)
    ORDER BY ae.fecha_real, h.hora_ini;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Boletín de calificaciones de un estudiante
CREATE OR REPLACE FUNCTION fn_boletin_estudiante(
    p_id_estudiante INT,
    p_id_periodo INT
)
RETURNS TABLE (
    estudiante_nombre TEXT,
    estudiante_apellidos TEXT,
    institucion_nombre TEXT,
    sede_nombre TEXT,
    grado INT,
    grupo INT,
    programa TEXT,
    periodo_anho INT,
    componente_nombre TEXT,
    componente_porcentaje NUMERIC,
    nota_valor NUMERIC,
    nota_ponderada NUMERIC,
    nota_final NUMERIC
) AS $$
DECLARE
    v_id_aula INT;
    v_grado INT;
    v_tipo_programa INT;
BEGIN
    v_id_aula := fn_obtener_aula_actual_estudiante(p_id_estudiante);
    
    IF v_id_aula IS NULL THEN
        RAISE EXCEPTION 'El estudiante % no existe o no tiene aula asignada', p_id_estudiante;
    END IF;
    
    v_grado := fn_obtener_grado_aula(v_id_aula);
    v_tipo_programa := fn_obtener_tipo_programa(v_grado);
    
    RETURN QUERY
    WITH notas_ponderadas AS (
        SELECT 
            c.nombre as comp_nombre,
            c.porcentaje as comp_porcentaje,
            COALESCE(n.valor, 0) as nota_val,
            COALESCE(n.valor, 0) * c.porcentaje / 100 as ponderada
        FROM componente c
        LEFT JOIN nota n ON n.id_comp = c.id AND n.id_estudiante = p_id_estudiante
        WHERE c.id_periodo = p_id_periodo
          AND c.tipo_programa = v_tipo_programa
    ),
    nota_total AS (
        SELECT SUM(ponderada) as total
        FROM notas_ponderadas
    )
    SELECT 
        e.nombre as estudiante_nombre,
        e.apellidos as estudiante_apellidos,
        i.nombre as institucion_nombre,
        se.nombre as sede_nombre,
        a.grado,
        a.grupo,
        CASE v_tipo_programa
            WHEN 1 THEN 'INSIDECLASSROOM'
            WHEN 2 THEN 'OUTSIDECLASSROOM'
        END as programa,
        pe.anho as periodo_anho,
        np.comp_nombre,
        np.comp_porcentaje,
        np.nota_val,
        np.ponderada,
        nt.total as nota_final
    FROM estudiante e
    INNER JOIN estudiante_aula ea ON e.id = ea.id_estudiante
    INNER JOIN aula a ON ea.id_aula = a.id
    INNER JOIN sede se ON a.id_sede = se.id
    INNER JOIN institucion i ON se.id_inst = i.id
    CROSS JOIN periodo pe
    CROSS JOIN notas_ponderadas np
    CROSS JOIN nota_total nt
    WHERE e.id = p_id_estudiante
      AND ea.fecha_desasignado IS NULL
      AND pe.id = p_id_periodo;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Estadísticas de asistencia por aula
CREATE OR REPLACE FUNCTION fn_estadisticas_asistencia_aula(
    p_id_aula INT,
    p_id_periodo INT
)
RETURNS TABLE (
    total_clases_programadas BIGINT,
    total_clases_dictadas BIGINT,
    total_clases_no_dictadas BIGINT,
    total_clases_repuestas BIGINT,
    porcentaje_asistencia NUMERIC,
    horas_totales_programadas NUMERIC,
    horas_totales_dictadas NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_clases_programadas,
        SUM(CASE WHEN at.dictoClase THEN 1 ELSE 0 END) as total_clases_dictadas,
        SUM(CASE WHEN NOT at.dictoClase THEN 1 ELSE 0 END) as total_clases_no_dictadas,
        SUM(CASE WHEN at.fecha_reposicion IS NOT NULL THEN 1 ELSE 0 END) as total_clases_repuestas,
        ROUND(
            (SUM(CASE WHEN at.dictoClase THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as porcentaje_asistencia,
        SUM(EXTRACT(EPOCH FROM (h.hora_fin - h.hora_ini)) / 3600) as horas_totales_programadas,
        SUM(
            CASE WHEN at.dictoClase 
            THEN EXTRACT(EPOCH FROM (h.hora_fin - h.hora_ini)) / 3600 
            ELSE 0 END
        ) as horas_totales_dictadas
    FROM asistenciaTut at
    INNER JOIN horario h ON at.id_horario = h.id
    INNER JOIN semana s ON at.id_semana = s.id
    WHERE at.id_aula = p_id_aula
      AND s.id_periodo = p_id_periodo;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Estadísticas de asistencia de estudiantes por aula
CREATE OR REPLACE FUNCTION fn_estadisticas_asistencia_estudiantes_aula(
    p_id_aula INT,
    p_id_periodo INT
)
RETURNS TABLE (
    id_estudiante INT,
    estudiante_nombre TEXT,
    total_clases INT,
    asistencias INT,
    inasistencias INT,
    porcentaje_asistencia NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as id_estudiante,
        (e.nombre || ' ' || e.apellidos) as estudiante_nombre,
        COUNT(ae.id)::INT as total_clases,
        SUM(CASE WHEN ae.presente THEN 1 ELSE 0 END)::INT as asistencias,
        SUM(CASE WHEN NOT ae.presente THEN 1 ELSE 0 END)::INT as inasistencias,
        ROUND(
            (SUM(CASE WHEN ae.presente THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(ae.id), 0)) * 100,
            2
        ) as porcentaje_asistencia
    FROM estudiante e
    INNER JOIN estudiante_aula ea ON e.id = ea.id_estudiante
    LEFT JOIN asistenciaEst ae ON ae.id_estudiante = e.id
    LEFT JOIN semana s ON ae.id_semana = s.id
    WHERE ea.id_aula = p_id_aula
      AND ea.fecha_desasignado IS NULL
      AND (s.id_periodo = p_id_periodo OR s.id_periodo IS NULL)
    GROUP BY e.id, e.nombre, e.apellidos
    ORDER BY estudiante_nombre;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Reporte de notas ingresadas por un tutor (Autogestión)
CREATE OR REPLACE FUNCTION fn_reporte_notas_tutor(
    p_id_tutor INT,
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    fecha_registro DATE, -- Nota: La tabla nota no tiene fecha de registro, usaremos la fecha actual o simulada si no existe columna de auditoría.
                         -- REVISIÓN: La tabla nota NO tiene fecha. Usaremos solo los datos disponibles.
    estudiante_nombre TEXT,
    aula_grado INT,
    aula_grupo INT,
    sede_nombre TEXT,
    institucion_nombre TEXT,
    componente_nombre TEXT,
    periodo_anho INT,
    periodo_numero INT,
    valor_nota NUMERIC,
    comentario TEXT
) AS $$
BEGIN
    -- Nota: Como no hay fecha de registro en la tabla 'nota', este reporte mostrará
    -- las notas actuales asignadas por el tutor, filtrando por la asignación del tutor al aula
    -- si se quisiera filtrar por fechas (lo cual es complejo sin columna de fecha en nota).
    -- Asumiremos que el reporte es del estado ACTUAL de las notas ingresadas por él.
    
    RETURN QUERY
    SELECT 
        CURRENT_DATE as fecha_registro, -- Placeholder
        (e.nombre || ' ' || e.apellidos) as estudiante_nombre,
        a.grado,
        a.grupo,
        s.nombre as sede_nombre,
        i.nombre as institucion_nombre,
        c.nombre as componente_nombre,
        p.anho as periodo_anho,
        p.numero as periodo_numero,
        n.valor,
        n.comentario
    FROM nota n
    INNER JOIN estudiante e ON n.id_estudiante = e.id
    INNER JOIN componente c ON n.id_comp = c.id
    INNER JOIN periodo p ON c.id_periodo = p.id
    INNER JOIN estudiante_aula ea ON e.id = ea.id_estudiante
    INNER JOIN aula a ON ea.id_aula = a.id
    INNER JOIN sede s ON a.id_sede = s.id
    INNER JOIN institucion i ON s.id_inst = i.id
    WHERE n.id_tutor = p_id_tutor
      AND ea.fecha_desasignado IS NULL
    ORDER BY a.grado, a.grupo, e.apellidos;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Reporte de asistencia del tutor - Historial de clases (Autogestión)
-- Incluye TODAS las clases programadas (marcadas Y pendientes)
CREATE OR REPLACE FUNCTION fn_reporte_asistencia_tutor(
    p_id_tutor INT,
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    fecha_real DATE,
    dia_semana TEXT,
    hora_inicio TIME,
    hora_fin TIME,
    aula_grado INT,
    aula_grupo INT,
    sede_nombre TEXT,
    institucion_nombre TEXT,
    dicto_clase BOOLEAN,
    fecha_reposicion DATE,
    motivo_descripcion TEXT,
    estado TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ahs.fecha_programada as fecha_real,
        CASE EXTRACT(DOW FROM ahs.fecha_programada)
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Lunes'
            WHEN 2 THEN 'Martes'
            WHEN 3 THEN 'Miércoles'
            WHEN 4 THEN 'Jueves'
            WHEN 5 THEN 'Viernes'
            WHEN 6 THEN 'Sábado'
        END as dia_semana,
        h.hora_ini as hora_inicio,
        h.hora_fin as hora_fin,
        a.grado as aula_grado,
        a.grupo as aula_grupo,
        s.nombre as sede_nombre,
        i.nombre as institucion_nombre,
        at.dictoClase as dicto_clase,
        at.fecha_reposicion,
        m.descripcion as motivo_descripcion,
        -- Determine estado based on attendance data
        CASE 
            WHEN at.id IS NULL THEN 'PENDIENTE'
            WHEN at.dictoClase THEN 'DICTADA'
            WHEN at.fecha_reposicion IS NOT NULL THEN 'REPUESTA'
            ELSE 'NO_DICTADA'
        END as estado
    FROM tutor_aula ta
    INNER JOIN aula_horario_sem ahs ON ta.id_aula = ahs.id_aula
    INNER JOIN horario h ON ahs.id_horario = h.id
    INNER JOIN aula a ON ahs.id_aula = a.id
    INNER JOIN sede s ON a.id_sede = s.id
    INNER JOIN institucion i ON s.id_inst = i.id
    LEFT JOIN asistenciaTut at ON (
        at.id_tutor = ta.id_tutor AND
        at.id_aula = ahs.id_aula AND
        at.id_horario = ahs.id_horario AND
        at.id_semana = ahs.id_semana
    )
    LEFT JOIN motivo m ON at.id_motivo = m.id
    WHERE ta.id_tutor = p_id_tutor
      AND ta.fecha_desasignado IS NULL
      AND (p_fecha_inicio IS NULL OR ahs.fecha_programada >= p_fecha_inicio)
      AND (p_fecha_fin IS NULL OR ahs.fecha_programada <= p_fecha_fin)
    ORDER BY ahs.fecha_programada ASC, h.hora_ini;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Horario asignado al tutor (Autogestión)
CREATE OR REPLACE FUNCTION fn_horario_tutor(
    p_id_tutor INT,
    p_id_periodo INT
)
RETURNS TABLE (
    aula_grado INT,
    aula_grupo INT,
    sede_nombre TEXT,
    dia_semana CHAR(2),
    hora_inicio TIME,
    hora_fin TIME
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        a.grado,
        a.grupo,
        s.nombre as sede_nombre,
        h.dia_sem,
        h.hora_ini,
        h.hora_fin
    FROM tutor_aula ta
    INNER JOIN aula a ON ta.id_aula = a.id
    INNER JOIN sede s ON a.id_sede = s.id
    INNER JOIN aula_horario_sem ahs ON a.id = ahs.id_aula
    INNER JOIN horario h ON ahs.id_horario = h.id
    INNER JOIN semana sem ON ahs.id_semana = sem.id
    WHERE ta.id_tutor = p_id_tutor
      AND ta.fecha_desasignado IS NULL
      AND sem.id_periodo = p_id_periodo
    ORDER BY 
        CASE h.dia_sem
            WHEN 'LU' THEN 1
            WHEN 'MA' THEN 2
            WHEN 'MI' THEN 3
            WHEN 'JU' THEN 4
            WHEN 'VI' THEN 5
            WHEN 'SA' THEN 6
        END,
        h.hora_ini;
END;
$$ LANGUAGE plpgsql STABLE;