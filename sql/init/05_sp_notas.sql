-- =====================================================
-- STORED PROCEDURES: GESTIÓN DE NOTAS
-- =====================================================

-- Procedure: Registrar o actualizar nota de un estudiante
CREATE OR REPLACE PROCEDURE sp_registrar_nota(
    p_id_estudiante INT,
    p_id_componente INT,
    p_id_tutor INT,
    p_valor NUMERIC,
    p_comentario TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_aula INT;
    v_grado INT;
    v_tipo_programa INT;
    v_tipo_programa_comp INT;
    v_tutor_actual INT;
    v_id_nota INT;
BEGIN
    -- Validar el valor de la nota
    IF p_valor < 0 OR p_valor > 100 THEN
        RAISE EXCEPTION 'El valor de la nota debe estar entre 0 y 100';
    END IF;
    
    v_id_aula := fn_obtener_aula_actual_estudiante(p_id_estudiante);
    
    IF v_id_aula IS NULL THEN
        RAISE EXCEPTION 'El estudiante % no existe o no tiene aula asignada', p_id_estudiante;
    END IF;
    
    v_grado := fn_obtener_grado_aula(v_id_aula);
    v_tipo_programa := fn_obtener_tipo_programa(v_grado);
    
    SELECT tipo_programa INTO v_tipo_programa_comp
    FROM componente
    WHERE id = p_id_componente;
    
    IF v_tipo_programa_comp IS NULL THEN
        RAISE EXCEPTION 'El componente % no existe', p_id_componente;
    END IF;
    
    IF v_tipo_programa_comp != v_tipo_programa THEN
        RAISE EXCEPTION 'El componente % no corresponde al tipo de programa del estudiante (grado %º)', 
            p_id_componente, v_grado;
    END IF;
    
    v_tutor_actual := fn_obtener_tutor_actual_aula(v_id_aula);
    
    IF v_tutor_actual != p_id_tutor THEN
        RAISE EXCEPTION 'El tutor % no está asignado al aula actual', p_id_tutor;
    END IF;
    
    SELECT id INTO v_id_nota
    FROM nota
    WHERE id_estudiante = p_id_estudiante AND id_comp = p_id_componente;
    
    IF v_id_nota IS NOT NULL THEN
        UPDATE nota
        SET valor = p_valor,
            comentario = p_comentario,
            id_tutor = p_id_tutor
        WHERE id = v_id_nota;
        
        RAISE NOTICE 'Nota actualizada para estudiante % en componente %: %', 
            p_id_estudiante, p_id_componente, p_valor;
    ELSE
        INSERT INTO nota (valor, comentario, id_tutor, id_comp, id_estudiante)
        VALUES (p_valor, p_comentario, p_id_tutor, p_id_componente, p_id_estudiante);
        
        RAISE NOTICE 'Nota registrada para estudiante % en componente %: %', 
            p_id_estudiante, p_id_componente, p_valor;
    END IF;
END;
$$;

-- Función: Calcular nota final de un estudiante en un periodo
CREATE OR REPLACE FUNCTION fn_calcular_nota_final_estudiante(
    p_id_estudiante INT,
    p_id_periodo INT
)
RETURNS TABLE (
    id_componente INT,
    nombre_componente TEXT,
    valor_nota NUMERIC,
    porcentaje NUMERIC,
    valor_ponderado NUMERIC,
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
    WITH notas_componentes AS (
        SELECT 
            c.id,
            c.nombre,
            COALESCE(n.valor, 0) as valor,
            c.porcentaje,
            COALESCE(n.valor, 0) * c.porcentaje / 100 as ponderado
        FROM componente c
        LEFT JOIN nota n ON n.id_comp = c.id AND n.id_estudiante = p_id_estudiante
        WHERE c.id_periodo = p_id_periodo
          AND c.tipo_programa = v_tipo_programa
    ),
    total_nota AS (
        SELECT SUM(ponderado) as nota_final
        FROM notas_componentes
    )
    SELECT 
        nc.id,
        nc.nombre,
        nc.valor,
        nc.porcentaje,
        nc.ponderado,
        tn.nota_final
    FROM notas_componentes nc
    CROSS JOIN total_nota tn;
END;
$$ LANGUAGE plpgsql STABLE;

-- Procedure: Validar que los porcentajes de componentes sumen 100%
CREATE OR REPLACE PROCEDURE sp_validar_porcentajes_periodo(
    p_id_periodo INT,
    p_tipo_programa INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_suma_porcentajes NUMERIC;
BEGIN
    SELECT SUM(porcentaje) INTO v_suma_porcentajes
    FROM componente
    WHERE id_periodo = p_id_periodo
      AND tipo_programa = p_tipo_programa;
    
    IF v_suma_porcentajes IS NULL THEN
        RAISE WARNING 'No hay componentes definidos para el periodo % y tipo programa %', p_id_periodo, p_tipo_programa;
    ELSIF v_suma_porcentajes != 100 THEN
        RAISE WARNING 'Los porcentajes de los componentes suman % (debería ser 100)', v_suma_porcentajes;
    ELSE
        RAISE NOTICE 'Los porcentajes de los componentes son correctos (100%%)';
    END IF;
END;
$$;

-- Función: Obtener promedio de notas de un aula en un componente
CREATE OR REPLACE FUNCTION fn_promedio_aula_componente(
    p_id_aula INT,
    p_id_componente INT
)
RETURNS NUMERIC AS $$
DECLARE
    v_promedio NUMERIC;
BEGIN
    SELECT ROUND(AVG(n.valor), 2) INTO v_promedio
    FROM nota n
    INNER JOIN estudiante_aula ea ON n.id_estudiante = ea.id_estudiante
    WHERE ea.id_aula = p_id_aula
      AND ea.fecha_desasignado IS NULL
      AND n.id_comp = p_id_componente;
    
    RETURN COALESCE(v_promedio, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Función: Obtener estudiantes con bajo rendimiento (nota < 3.0)
CREATE OR REPLACE FUNCTION fn_estudiantes_bajo_rendimiento(
    p_id_aula INT,
    p_id_periodo INT
)
RETURNS TABLE (
    id_estudiante INT,
    nombre_completo TEXT,
    nota_final NUMERIC,
    componentes_reprobados INT
) AS $$
BEGIN
    RETURN QUERY
    WITH notas_finales AS (
        SELECT 
            e.id,
            e.nombre || ' ' || e.apellidos as nombre,
            (SELECT nota_final FROM fn_calcular_nota_final_estudiante(e.id, p_id_periodo) LIMIT 1) as nota,
            (SELECT COUNT(*) FROM nota n 
             INNER JOIN componente c ON n.id_comp = c.id
             WHERE n.id_estudiante = e.id 
               AND c.id_periodo = p_id_periodo 
               AND n.valor < 3.0) as reprobados
        FROM estudiante e
        INNER JOIN estudiante_aula ea ON e.id = ea.id_estudiante
        WHERE ea.id_aula = p_id_aula
          AND ea.fecha_desasignado IS NULL
    )
    SELECT 
        id,
        nombre,
        nota,
        reprobados::INT
    FROM notas_finales
    WHERE nota < 3.0
    ORDER BY nota ASC;
END;
$$ LANGUAGE plpgsql STABLE;