
-- PROCEDURES PARA PERIODOS Y SEMANAS

--============================
--    PERIODOS Y SEMANAS
--============================
-- Procedure: Crear calendario de semanas para un periodo
CREATE OR REPLACE PROCEDURE sp_crear_calendario_semanas(
    p_id_periodo INT,
    p_fecha_inicio DATE,
    p_cantidad_semanas INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_fecha_actual DATE;
    v_contador INT := 0;
    v_dow INT; --Day Of Week
BEGIN
    -- Validaciones
    IF NOT EXISTS (SELECT 1 FROM periodo WHERE id = p_id_periodo) THEN
        RAISE EXCEPTION 'El periodo % no existe', p_id_periodo;
    END IF;
    
    IF p_cantidad_semanas <= 0 OR p_cantidad_semanas > 53 THEN
        RAISE EXCEPTION 'La cantidad debe estar entre 1 y 53';
    END IF;
    
    IF EXISTS (SELECT 1 FROM semana WHERE id_periodo = p_id_periodo) THEN
        RAISE EXCEPTION 'Ya existen semanas para el periodo %', p_id_periodo;
    END IF;
    
    -- AJUSTAR AL LUNES MÁS CERCANO 
    v_fecha_actual := p_fecha_inicio;
    v_dow := EXTRACT(DOW FROM v_fecha_actual)::INT;
    
    IF v_dow = 0 THEN  -- Domingo
        v_fecha_actual := v_fecha_actual + INTERVAL '1 day';
    ELSIF v_dow > 1 THEN  -- Martes-Sábado
        v_fecha_actual := v_fecha_actual - (v_dow - 1) * INTERVAL '1 day';
    END IF;
    
    -- Crear semanas
    FOR i IN 1..p_cantidad_semanas LOOP
        INSERT INTO semana (fec_ini, numero_semana, id_periodo)
        VALUES (v_fecha_actual, i, p_id_periodo);
        
        v_contador := v_contador + 1;
        v_fecha_actual := v_fecha_actual + INTERVAL '7 days';
    END LOOP;
    
    RAISE NOTICE 'Se crearon % semanas para el periodo %', v_contador, p_id_periodo;
END;
$$;

-- Función: Obtener información sobre las semanas en un periodo
CREATE OR REPLACE FUNCTION fn_info_calendario_periodo(
    p_id_periodo INT
)
RETURNS TABLE (
    total_semanas INT,
    primera_semana_inicio DATE,
    primera_semana_fin DATE,
    ultima_semana_inicio DATE,
    ultima_semana_fin DATE,
    duracion_dias INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INT as total_semanas,
        MIN(fec_ini) as primera_semana_inicio,
        (SELECT fec_fin FROM semana WHERE id_periodo = p_id_periodo ORDER BY fec_ini LIMIT 1) as primera_semana_fin,
        MAX(fec_ini) as ultima_semana_inicio,
        (SELECT fec_fin FROM semana WHERE id_periodo = p_id_periodo ORDER BY fec_ini DESC LIMIT 1) as ultima_semana_fin,
        ((SELECT fec_fin FROM semana WHERE id_periodo = p_id_periodo ORDER BY fec_ini DESC LIMIT 1) - 
         MIN(fec_ini) + 1)::INT as duracion_dias
    FROM semana
    WHERE id_periodo = p_id_periodo;
END;
$$ LANGUAGE plpgsql STABLE;





--============================
--          FESTIVOS
--============================
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