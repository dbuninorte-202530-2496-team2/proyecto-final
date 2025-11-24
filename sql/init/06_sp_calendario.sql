-- =====================================================
-- STORED PROCEDURES: GESTIÓN DE CALENDARIO v2.0
-- =====================================================

-- Procedure: Crear calendario de semanas para un periodo
CREATE OR REPLACE PROCEDURE sp_crear_calendario_semanas(
    p_id_periodo INT,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
LANGUAGE plpgsql AS $$
DECLARE
    v_fecha_actual DATE;
    v_fecha_fin_semana DATE;
    v_contador INT := 0;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM periodo WHERE id = p_id_periodo) THEN
        RAISE EXCEPTION 'El periodo % no existe', p_id_periodo;
    END IF;
    
    IF p_fecha_inicio >= p_fecha_fin THEN
        RAISE EXCEPTION 'La fecha de inicio debe ser anterior a la fecha fin';
    END IF;
    
    IF EXISTS (SELECT 1 FROM semana WHERE id_periodo = p_id_periodo) THEN
        RAISE EXCEPTION 'Ya existen semanas creadas para el periodo %. Elimínelas primero si desea recrear el calendario', p_id_periodo;
    END IF;
    
    v_fecha_actual := p_fecha_inicio;
    v_fecha_actual := v_fecha_actual - EXTRACT(DOW FROM v_fecha_actual)::INT + 1;
    IF EXTRACT(DOW FROM v_fecha_actual) = 0 THEN
        v_fecha_actual := v_fecha_actual + 1;
    END IF;
    
    WHILE v_fecha_actual < p_fecha_fin LOOP
        v_fecha_fin_semana := v_fecha_actual + INTERVAL '6 days';
        
        IF v_fecha_fin_semana > p_fecha_fin THEN
            v_fecha_fin_semana := p_fecha_fin;
        END IF;
        
        INSERT INTO semana (fec_ini, fec_fin, id_periodo)
        VALUES (v_fecha_actual, v_fecha_fin_semana, p_id_periodo);
        
        v_contador := v_contador + 1;
        v_fecha_actual := v_fecha_fin_semana + INTERVAL '1 day';
    END LOOP;
    
    RAISE NOTICE 'Se crearon % semanas para el periodo % (% a %)', 
        v_contador, p_id_periodo, p_fecha_inicio, p_fecha_fin;
END;
$$;

-- Procedure: Registrar festivo
CREATE OR REPLACE PROCEDURE sp_registrar_festivo(
    p_fecha DATE,
    p_descripcion TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM festivo WHERE fecha = p_fecha) THEN
        UPDATE festivo
        SET descripcion = p_descripcion
        WHERE fecha = p_fecha;
        
        RAISE NOTICE 'Festivo actualizado para fecha %', p_fecha;
    ELSE
        INSERT INTO festivo (fecha, descripcion)
        VALUES (p_fecha, p_descripcion);
        
        RAISE NOTICE 'Festivo registrado para fecha %', p_fecha;
    END IF;
END;
$$;

-- Procedure: Registrar múltiples festivos
CREATE OR REPLACE PROCEDURE sp_registrar_festivos_masivo(
    p_festivos JSON
)
LANGUAGE plpgsql AS $$
DECLARE
    v_festivo JSON;
BEGIN
    FOR v_festivo IN SELECT * FROM json_array_elements(p_festivos)
    LOOP
        CALL sp_registrar_festivo(
            (v_festivo->>'fecha')::DATE,
            v_festivo->>'descripcion'
        );
    END LOOP;
    
    RAISE NOTICE 'Festivos registrados masivamente';
END;
$$;

-- Procedure: Eliminar semanas de un periodo
CREATE OR REPLACE PROCEDURE sp_eliminar_semanas_periodo(
    p_id_periodo INT,
    p_confirmar BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql AS $$
DECLARE
    v_cantidad_semanas INT;
BEGIN
    IF NOT p_confirmar THEN
        RAISE EXCEPTION 'Debe confirmar la eliminación estableciendo p_confirmar = TRUE';
    END IF;
    
    SELECT COUNT(*) INTO v_cantidad_semanas
    FROM semana
    WHERE id_periodo = p_id_periodo;
    
    IF v_cantidad_semanas = 0 THEN
        RAISE NOTICE 'No hay semanas para eliminar en el periodo %', p_id_periodo;
        RETURN;
    END IF;
    
    DELETE FROM semana
    WHERE id_periodo = p_id_periodo;
    
    RAISE NOTICE '% semanas eliminadas del periodo %', v_cantidad_semanas, p_id_periodo;
END;
$$;

-- Función: Obtener días hábiles entre dos fechas
CREATE OR REPLACE FUNCTION fn_dias_habiles_entre_fechas(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS INT AS $$
DECLARE
    v_fecha_actual DATE;
    v_contador INT := 0;
BEGIN
    v_fecha_actual := p_fecha_inicio;
    
    WHILE v_fecha_actual <= p_fecha_fin LOOP
        IF EXTRACT(DOW FROM v_fecha_actual) BETWEEN 1 AND 5 
           AND NOT fn_es_festivo(v_fecha_actual) THEN
            v_contador := v_contador + 1;
        END IF;
        
        v_fecha_actual := v_fecha_actual + INTERVAL '1 day';
    END LOOP;
    
    RETURN v_contador;
END;
$$ LANGUAGE plpgsql STABLE;

-- Vista: Resumen de semanas por periodo
CREATE OR REPLACE VIEW v_semanas_periodo AS
SELECT 
    p.id as id_periodo,
    p.anho,
    s.id as id_semana,
    s.fec_ini,
    s.fec_fin,
    s.fec_fin - s.fec_ini + 1 as dias_semana,
    fn_dias_habiles_entre_fechas(s.fec_ini, s.fec_fin) as dias_habiles
FROM periodo p
INNER JOIN semana s ON s.id_periodo = p.id
ORDER BY p.anho, s.fec_ini;