-- =====================================================
-- LIMPIEZA COMPLETA
-- TRUNCATE ... RESTART IDENTITY
-- Eliminación, reinicio de sequences, evita errores de FK
-- =====================================================
TRUNCATE 
    nota,
    componente,
    asistenciaTut,
    asistenciaEst,
    estudiante_aula,
    tutor_aula,
    aula_horario_sem,
    estudiante,
    semana,
    periodo,
    festivo,
    aula,
    sede,
    institucion,
    personal,
    usuario,
    horario,
    motivo,
    tipoDocumento,
    rol
RESTART IDENTITY CASCADE;

-- =====================================================
-- CONFIGURACIÓN BASE
-- =====================================================

-- Roles
INSERT INTO rol (nombre, descripcion) VALUES
('TUTOR', 'Docente de inglés'),
('ADMINISTRATIVO', 'Gestión administrativa'),
('ADMINISTRADOR', 'Administrador del sistema');

-- Tipos de documento
INSERT INTO tipoDocumento (codigo, descripcion) VALUES
('RC', 'Registro Civil'),
('TI', 'Tarjeta de Identidad'),
('CC', 'Cédula de ciudadanía'),
('TE', 'Tarjeta de extranjería'),
('CE', 'Cédula de extranjería'),
('NIT', 'Número de identificación tributaria'),
('PP', 'Pasaporte'),
('PEP', 'Permiso especial de permanencia'),
('DIE', 'Documento de identificación extranjero'),
('NUIP', 'NUIP'),
('FOREIGN_NIT', 'NIT de otro país');

-- Motivos de inasistencia
INSERT INTO motivo (descripcion) VALUES
('Enfermedad'),
('Calamidad doméstica'),
('Permiso personal'),
('Capacitación'),
('Incapacidad médica'),
('Festivo (día no laborable)'),
('Fuerza mayor'),
('Problema de transporte'),
('Actividad institucional'),
('Otro');

-- Festivos 2025
INSERT INTO festivo (fecha, descripcion) VALUES
('2025-01-01', 'Año Nuevo'),
('2025-01-06', 'Día de los Reyes Magos'),
('2025-03-24', 'Día de San José'),
('2025-04-17', 'Jueves Santo'),
('2025-04-18', 'Viernes Santo'),
('2025-05-01', 'Día del Trabajo'),
('2025-07-20', 'Día de la Independencia'),
('2025-08-07', 'Batalla de Boyacá'),
('2025-12-25', 'Navidad');

-- =====================================================
-- USUARIOS Y PERSONAL
-- =====================================================

-- Administrador
--PARA LAS CONTRASEÑAS se usan hashes bcrypt pregenerados (12 rounds)

--contrasena=admin123
INSERT INTO usuario (usuario, contrasena) VALUES ('administrador', '$2a$12$2vbDZEerwi6JxAng2g7efuBeIrkwgICYN2pGzOzX2GoK1xq.uEG/y');
INSERT INTO personal (codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc) VALUES
('1000000000', 'Admin', 'Sistema', 'admin@globalenglish.com', '3001234567', 3, 'administrador', 3);

-- Tutores
--contrasena=tutor123 en ambos
INSERT INTO usuario (usuario, contrasena) VALUES 
('tutor1', '$2a$12$3gXwH6poHIzL2RkxDHwpbexi3RtlZKm6z6dY8FkKOloPtHqElh4Ma'),
('tutor2', '$2a$12$3gXwH6poHIzL2RkxDHwpbexi3RtlZKm6z6dY8FkKOloPtHqElh4Ma');

INSERT INTO personal (codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc) VALUES
('1094123456', 'María', 'González', 'maria.gonzalez@example.com', '3101234567', 1, 'tutor1', 3),
('1003456789', 'Carlos', 'Ramírez', 'carlos.ramirez@example.com', '3209876543', 1, 'tutor2', 3);

-- =====================================================
-- INSTITUCIÓN Y SEDES
-- =====================================================

INSERT INTO institucion (id, nombre, correo, jornada, nombre_contacto, telefono_contacto) VALUES
(1, 'Institución Educativa San José', 'contacto@sanjose.edu.co', 'ÚNICA', 'Rector Principal', '3151234567');

INSERT INTO sede (id, nombre, direccion, id_inst, is_principal) VALUES
(1, 'Sede Principal', 'Calle 5 # 10-20, Cali', 1, TRUE),
(2, 'Sede Norte', 'Carrera 15 # 25-30, Cali', 1, FALSE);

-- =====================================================
-- AULAS - Demostración de grados permitidos
-- =====================================================

-- INSIDECLASSROOM (4º y 5º)
INSERT INTO aula (id, grado, grupo, id_sede) VALUES
(1, 4, 1, 1),  -- 4º grado, grupo 1, sede principal
(2, 5, 1, 1);  -- 5º grado, grupo 1, sede principal

-- OUTSIDECLASSROOM (9º y 10º)
INSERT INTO aula (id, grado, grupo, id_sede) VALUES
(3, 9, 1, 1),  -- 9º grado, grupo 1, sede principal
(4, 10, 1, 2); -- 10º grado, grupo 1, sede norte

-- =====================================================
-- HORARIOS - Diferentes configuraciones
-- =====================================================

-- Horarios para INSIDECLASSROOM (dentro de jornada escolar)
INSERT INTO horario (id, dia_sem, hora_ini, hora_fin) VALUES
(1, 'LU', '08:00', '09:00'),  -- Lunes 8-9am
(2, 'MI', '10:00', '11:00'),  -- Miércoles 10-11am
(3, 'VI', '14:00', '15:00');  -- Viernes 2-3pm

-- Horarios para OUTSIDECLASSROOM (fuera de jornada)
INSERT INTO horario (id, dia_sem, hora_ini, hora_fin) VALUES
(4, 'MA', '16:00', '18:00'),  -- Martes 4-6pm (2 horas)
(5, 'JU', '16:00', '18:00'),  -- Jueves 4-6pm
(6, 'SA', '09:00', '12:00');  -- Sábado 9-12pm (3 horas)

-- =====================================================
-- PERIODO Y SEMANAS
-- =====================================================

INSERT INTO periodo (anho) VALUES (2025);
-- El periodo genera id=1

-- Semanas del periodo (fec_fin se calcula automáticamente)
INSERT INTO semana (fec_ini, id_periodo) VALUES
('2025-01-06', 1),  -- Semana 1: ene 6-12
('2025-01-13', 1),  -- Semana 2: ene 13-19
('2025-01-20', 1),  -- Semana 3: ene 20-26
('2025-01-27', 1);  -- Semana 4: ene 27 - feb 2

-- =====================================================
-- ASIGNACIÓN DE HORARIOS A AULAS (por semana)
-- =====================================================

-- Aula 1 (4º grado): Lunes y Miércoles, semanas 1-4
INSERT INTO aula_horario_sem (id_aula, id_horario, id_semana) VALUES
(1, 1, 1), (1, 1, 2), (1, 1, 3), (1, 1, 4),  -- Lunes
(1, 2, 1), (1, 2, 2), (1, 2, 3), (1, 2, 4);  -- Miércoles

-- Aula 3 (9º grado): Martes y Jueves, semanas 1-4
INSERT INTO aula_horario_sem (id_aula, id_horario, id_semana) VALUES
(3, 4, 1), (3, 4, 2), (3, 4, 3), (3, 4, 4),  -- Martes
(3, 5, 1), (3, 5, 2), (3, 5, 3), (3, 5, 4);  -- Jueves

-- =====================================================
-- ASIGNACIÓN DE TUTORES A AULAS
-- =====================================================

-- María (id=1) enseña 4º grado
INSERT INTO tutor_aula (id_tutor, id_aula, consec, fecha_asignado, fecha_desasignado) VALUES
(1, 1, 1, '2025-01-06', NULL);

-- Carlos (id=2) enseña 9º grado
INSERT INTO tutor_aula (id_tutor, id_aula, consec, fecha_asignado, fecha_desasignado) VALUES
(2, 3, 1, '2025-01-06', NULL);

-- =====================================================
-- ESTUDIANTES
-- =====================================================

-- Estudiantes de 4º grado (INSIDECLASSROOM)
INSERT INTO estudiante (codigo, nombre, apellidos, score_in, score_out, tipo_doc) VALUES
('1234567890', 'Juan', 'Pérez López', 25.5, NULL, 2),
('1234567891', 'Ana', 'García Ruiz', 28.0, NULL, 2),
('1234567892', 'Luis', 'Martínez Cruz', 22.5, NULL, 2),
('1234567893', 'Sofia', 'Rodríguez Gómez', 30.0, NULL, 2);

-- Estudiantes de 9º grado (OUTSIDECLASSROOM)
INSERT INTO estudiante (codigo, nombre, apellidos, score_in, score_out, tipo_doc) VALUES
('9876543210', 'Pedro', 'Sánchez Villa', 45.0, NULL, 3),
('9876543211', 'Laura', 'Torres Méndez', 48.5, NULL, 3),
('9876543212', 'Diego', 'Morales Castro', 42.0, NULL, 3);

-- =====================================================
-- ASIGNACIÓN DE ESTUDIANTES A AULAS
-- =====================================================

-- 4º grado (aula 1)
INSERT INTO estudiante_aula (id_estudiante, id_aula, consec, fecha_asignado, fecha_desasignado) VALUES
(1, 1, 1, '2025-01-06', NULL),
(2, 1, 1, '2025-01-06', NULL),
(3, 1, 1, '2025-01-06', NULL),
(4, 1, 1, '2025-01-06', NULL);

-- 9º grado (aula 3)
INSERT INTO estudiante_aula (id_estudiante, id_aula, consec, fecha_asignado, fecha_desasignado) VALUES
(5, 3, 1, '2025-01-06', NULL),
(6, 3, 1, '2025-01-06', NULL),
(7, 3, 1, '2025-01-06', NULL);

-- =====================================================
-- COMPONENTES DE EVALUACIÓN
-- =====================================================

-- Componentes para INSIDECLASSROOM (tipo 1)
INSERT INTO componente (nombre, tipo_programa, porcentaje, id_periodo) VALUES
('Participación en Clase', 1, 20, 1),
('Tareas y Ejercicios', 1, 20, 1),
('Evaluación Parcial', 1, 30, 1),
('Evaluación Final', 1, 30, 1);

-- Componentes para OUTSIDECLASSROOM (tipo 2)
INSERT INTO componente (nombre, tipo_programa, porcentaje, id_periodo) VALUES
('Participación en Clase', 2, 20, 1),
('Tareas y Proyectos', 2, 20, 1),
('Evaluación Parcial', 2, 30, 1),
('Evaluación Final', 2, 30, 1);

-- =====================================================
-- ASISTENCIAS DE TUTORES - Casos de uso
-- =====================================================

-- CASO 1: Clase normal dictada (lunes 6 ene)
INSERT INTO asistenciaTut (fecha_real, dictoClase, id_tutor, id_aula, id_horario, id_semana, id_motivo, fecha_reposicion) VALUES
('2025-01-06', TRUE, 1, 1, 1, 1, NULL, NULL);

-- CASO 2: Clase cancelada por festivo con reposición (lunes 6 ene reyes)
-- Nota: El 6 de enero ES festivo pero lo dejamos para demostrar
INSERT INTO asistenciaTut (fecha_real, dictoClase, id_tutor, id_aula, id_horario, id_semana, id_motivo, fecha_reposicion) VALUES
('2025-01-06', FALSE, 2, 3, 4, 1, 6, '2025-01-09');

-- CASO 3: Clase cancelada por enfermedad SIN reposición todavía
INSERT INTO asistenciaTut (fecha_real, dictoClase, id_tutor, id_aula, id_horario, id_semana, id_motivo, fecha_reposicion) VALUES
('2025-01-08', FALSE, 1, 1, 2, 1, 1, NULL);

-- CASO 4: Clases normales semana 2
INSERT INTO asistenciaTut (fecha_real, dictoClase, id_tutor, id_aula, id_horario, id_semana, id_motivo, fecha_reposicion) VALUES
('2025-01-13', TRUE, 1, 1, 1, 2, NULL, NULL),
('2025-01-15', TRUE, 1, 1, 2, 2, NULL, NULL);

-- =====================================================
-- ASISTENCIAS DE ESTUDIANTES
-- =====================================================

-- Asistencias para la clase del lunes 6 ene (aula 1, 4º grado)
INSERT INTO asistenciaEst (fecha_real, presente, id_estudiante, id_aula, id_horario, id_semana) VALUES
('2025-01-06', TRUE, 1, 1, 1, 1),   -- Juan presente
('2025-01-06', TRUE, 2, 1, 1, 1),   -- Ana presente
('2025-01-06', FALSE, 3, 1, 1, 1),  -- Luis ausente
('2025-01-06', TRUE, 4, 1, 1, 1);   -- Sofia presente

-- Asistencias para la REPOSICIÓN del 9 ene (aula 3, 9º grado)
INSERT INTO asistenciaEst (fecha_real, presente, id_estudiante, id_aula, id_horario, id_semana) VALUES
('2025-01-09', TRUE, 5, 3, 4, 1),   -- Pedro presente en reposición
('2025-01-09', FALSE, 6, 3, 4, 1),  -- Laura ausente
('2025-01-09', TRUE, 7, 3, 4, 1);   -- Diego presente

-- Asistencias semana 2
INSERT INTO asistenciaEst (fecha_real, presente, id_estudiante, id_aula, id_horario, id_semana) VALUES
('2025-01-13', TRUE, 1, 1, 1, 2),
('2025-01-13', TRUE, 2, 1, 1, 2),
('2025-01-13', TRUE, 3, 1, 1, 2),
('2025-01-13', FALSE, 4, 1, 1, 2);

-- =====================================================
-- NOTAS - Demostración de cálculo de definitiva
-- =====================================================

-- Notas para Juan (estudiante 1, 4º grado - componentes 1-4)
INSERT INTO nota (valor, comentario, id_tutor, id_comp, id_estudiante) VALUES
(4.5, 'Excelente participación', 1, 1, 1),
(4.0, 'Cumple con tareas', 1, 2, 1),
(3.8, 'Buen desempeño', 1, 3, 1),
(4.2, NULL, 1, 4, 1);
-- Definitiva Juan: (4.5*20 + 4.0*20 + 3.8*30 + 4.2*30)/100 = 4.08

-- Notas para Ana (estudiante 2, 4º grado)
INSERT INTO nota (valor, comentario, id_tutor, id_comp, id_estudiante) VALUES
(5.0, 'Sobresaliente', 1, 1, 2),
(4.8, 'Muy dedicada', 1, 2, 2),
(4.5, NULL, 1, 3, 2);
-- Falta examen final (componente 4)
-- Definitiva Ana: (5.0*20 + 4.8*20 + 4.5*30 + 0*30)/100 = 3.31

-- Notas para Pedro (estudiante 5, 9º grado - componentes 5-8)
INSERT INTO nota (valor, comentario, id_tutor, id_comp, id_estudiante) VALUES
(3.5, 'Puede mejorar', 2, 5, 5),
(3.8, NULL, 2, 6, 5),
(2.9, 'Necesita refuerzo', 2, 7, 5),
(3.2, NULL, 2, 8, 5);
-- Definitiva Pedro: (3.5*20 + 3.8*20 + 2.9*30 + 3.2*30)/100 = 3.29

-- =====================================================
-- CASO DE USO: Cambio de tutor (historial)
-- =====================================================

-- Supongamos que María renuncia y entra un nuevo tutor
-- Primero cerraríamos su asignación (con sp_cambiar_tutor_aula):
-- UPDATE tutor_aula SET fecha_desasignado = '2025-02-01' WHERE id_tutor = 1 AND id_aula = 1;
-- INSERT INTO tutor_aula VALUES (3, 1, 1, '2025-02-01', NULL);  -- nuevo tutor

-- =====================================================
-- CASO DE USO: Estudiante cambia de aula
-- =====================================================

-- Luis (estudiante 3) se mueve de 4º a 5º (ambos permitidos: primaria)
-- Esto lo harías con sp_mover_estudiante_aula:
-- UPDATE estudiante_aula SET fecha_desasignado = '2025-02-01' WHERE id_estudiante = 3 AND id_aula = 1;
-- INSERT INTO estudiante_aula VALUES (3, 2, 1, '2025-02-01', NULL);