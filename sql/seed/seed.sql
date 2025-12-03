-- =====================================================
-- Eliminación, reinicio de sequences.
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
('Festivo'),
('Fuerza mayor'),
('Problema de transporte'),
('Actividad institucional'),
('Otro');

-- Festivos
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
--PARA LAS CONTRASEÑAS se usan hashes bcrypt pregenerados

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
-- HORARIOS
-- =====================================================

-- Horarios para INSIDECLASSROOM (dentro de jornada escolar)
INSERT INTO horario (dia_sem, hora_ini, hora_fin) VALUES
('MA', '08:00', '09:00'),
('MI', '10:00', '10:50'),
('VI', '14:00', '15:00');

-- Horarios para OUTSIDECLASSROOM (fuera de jornada)
INSERT INTO horario (dia_sem, hora_ini, hora_fin) VALUES
('MA', '18:00', '18:40'),
('JU', '18:00', '19:00'),
('SA', '09:00', '9:55');

-- =====================================================
-- PERIODO Y SEMANAS
-- =====================================================

INSERT INTO periodo (anho, numero) VALUES (2025, 1);

-- Semanas del periodo (fec_fin se calcula automáticamente)
-- fec_ini debe ser lunes
INSERT INTO semana (fec_ini, id_periodo) VALUES
('2025-01-06', 1),
('2025-01-13', 1),
('2025-01-20', 1),
('2025-01-27', 1); 

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