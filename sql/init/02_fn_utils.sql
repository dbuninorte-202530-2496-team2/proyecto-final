-- Función: Verificar si una fecha es festivo
CREATE OR REPLACE FUNCTION fn_es_festivo(p_fecha DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM festivo WHERE fecha = p_fecha
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Función: Obtener el tutor actual de un aula
CREATE OR REPLACE FUNCTION fn_obtener_tutor_actual_aula(p_id_aula INT)
RETURNS INT AS $$
DECLARE
    v_id_tutor INT;
BEGIN
    SELECT id_tutor INTO v_id_tutor
    FROM tutor_aula
    WHERE id_aula = p_id_aula 
      AND fecha_desasignado IS NULL
    ORDER BY consec DESC
    LIMIT 1;
    
    RETURN v_id_tutor;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función: Obtener el aula actual de un estudiante
CREATE OR REPLACE FUNCTION fn_obtener_aula_actual_estudiante(p_id_estudiante INT)
RETURNS INT AS $$
DECLARE
    v_id_aula INT;
BEGIN
    SELECT id_aula INTO v_id_aula
    FROM estudiante_aula
    WHERE id_estudiante = p_id_estudiante 
      AND fecha_desasignado IS NULL
    ORDER BY consec DESC
    LIMIT 1;
    
    RETURN v_id_aula;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función: Validar que el horario pertenece al aula en una semana
CREATE OR REPLACE FUNCTION fn_horario_pertenece_aula_semana(
    p_id_aula INT,
    p_id_horario INT,
    p_id_semana INT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM aula_horario_sem 
        WHERE id_aula = p_id_aula 
          AND id_horario = p_id_horario
          AND id_semana = p_id_semana
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Función: Obtener el grado del aula
CREATE OR REPLACE FUNCTION fn_obtener_grado_aula(p_id_aula INT)
RETURNS INT AS $$
DECLARE
    v_grado INT;
BEGIN
    SELECT grado INTO v_grado
    FROM aula
    WHERE id = p_id_aula;
    
    RETURN v_grado;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función: Validar compatibilidad de grados (4-5 o 9-10)
CREATE OR REPLACE FUNCTION fn_validar_compatibilidad_grados(
    p_grado_origen INT,
    p_grado_destino INT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        (p_grado_origen IN (4, 5) AND p_grado_destino IN (4, 5)) OR
        (p_grado_origen IN (9, 10) AND p_grado_destino IN (9, 10))
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función: Obtener semana actual por fecha
CREATE OR REPLACE FUNCTION fn_obtener_semana_por_fecha(p_fecha DATE)
RETURNS INT AS $$
DECLARE
    v_id_semana INT;
BEGIN
    SELECT id INTO v_id_semana
    FROM semana
    WHERE p_fecha BETWEEN fec_ini AND fec_fin
    LIMIT 1;
    
    RETURN v_id_semana;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función: Obtener tipo de programa por grado (1=INSIDECLASSROOM, 2=OUTSIDECLASSROOM)
CREATE OR REPLACE FUNCTION fn_obtener_tipo_programa(p_grado INT)
RETURNS INT AS $$
BEGIN
    RETURN CASE 
        WHEN p_grado IN (4, 5) THEN 1
        WHEN p_grado IN (9, 10) THEN 2
        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;