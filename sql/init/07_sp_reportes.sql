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