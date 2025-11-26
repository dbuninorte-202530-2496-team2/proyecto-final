CREATE TABLE IF NOT EXISTS rol(
	id serial PRIMARY KEY, --serial maneja sequences internas para generar ids enteros
	nombre text NOT NULL,
	descripcion text
);
CREATE UNIQUE INDEX uq_rol_nombre_clean
ON rol (LOWER(TRIM(nombre)));

CREATE TABLE IF NOT EXISTS usuario(
	usuario text PRIMARY KEY,
	contrasena text NOT NULL
);

CREATE TABLE IF NOT EXISTS tipoDocumento(
	id serial PRIMARY KEY,
	codigo varchar(11) NOT NULL,
	descripcion text
);

CREATE TABLE IF NOT EXISTS personal(
	id serial PRIMARY KEY,
	codigo varchar(20) UNIQUE NOT NULL,
	nombre text NOT NULL,
	apellido text,
	correo text,
	telefono varchar(20),
	id_rol int,
	usuario text UNIQUE,
	tipo_doc int NOT NULL,
	FOREIGN KEY (id_rol) REFERENCES rol(id),
	FOREIGN KEY (usuario) REFERENCES usuario(usuario),
	FOREIGN KEY (tipo_doc) REFERENCES tipoDocumento(id)
);

CREATE TABLE IF NOT EXISTS institucion(
	id serial PRIMARY KEY,
	nombre text NOT NULL,
	correo text,
	jornada text NOT NULL,
	nombre_contacto text,
	telefono_contacto varchar(20)
);

CREATE TABLE IF NOT EXISTS sede(
	id serial PRIMARY KEY,
	nombre text NOT NULL,
	direccion text,
	id_inst int NOT NULL,
	is_principal boolean NOT NULL,
	FOREIGN KEY (id_inst) REFERENCES institucion(id)
);

CREATE TABLE IF NOT EXISTS aula(
	id serial PRIMARY KEY,
	grado int NOT NULL,
	grupo int NOT NULL,
	-- 1: INSIDECLASSROOM, 2: OUTSIDECLASSROOM
	tipo_programa int GENERATED ALWAYS AS (
        CASE 
            WHEN grado IN (4, 5) THEN 1
            WHEN grado IN (9, 10) THEN 2
        END
    ) STORED,
	id_sede int NOT NULL,
	FOREIGN KEY (id_sede) REFERENCES sede(id),
	CHECK (grado IN (4, 5, 9, 10))
);

CREATE TABLE IF NOT EXISTS horario(
	id serial PRIMARY KEY,
	dia_sem char(2) NOT NULL,
	hora_ini time NOT NULL,
	hora_fin time NOT NULL,
	CHECK (dia_sem IN ('LU', 'MA', 'MI', 'JU', 'VI', 'SA')),
	-- Cada horario es una hora equivalente
	CHECK (
    (hora_fin - hora_ini) IN (
        INTERVAL '40 minutes',
        INTERVAL '45 minutes',
        INTERVAL '50 minutes',
        INTERVAL '55 minutes',
        INTERVAL '60 minutes'
    )
)

);

CREATE TABLE IF NOT EXISTS periodo(
	id serial PRIMARY KEY,
	anho int NOT NULL,
	numero int NOT NULL,
	UNIQUE (anho, numero)
);

CREATE TABLE IF NOT EXISTS semana(
	id serial PRIMARY KEY,
	fec_ini date NOT NULL,
	fec_fin date GENERATED ALWAYS AS (fec_ini + INTERVAL '6 days') STORED,
	id_periodo int NOT NULL,
	FOREIGN KEY (id_periodo) REFERENCES periodo(id),
	UNIQUE (fec_ini), --Solo una aparición global de la semana. Ligada a un solo periodo
	CHECK (EXTRACT(DOW FROM fec_ini) = 1) --Forzar inicio en lunes para uniformidad
);





 

-- aula_horario_sem equivale al ejemplar específico de una clase.
-- Se busca flexibilidad para horarios irregulares en un periodo,
-- además de la posibilidad de almacenar clases de reposición
-- como filas. Así se separa la no asistencia a la clase original 
-- de la asistencia a la reposición.
CREATE TABLE IF NOT EXISTS aula_horario_sem(
	id_aula int,
	id_horario int,
	id_semana int,
	fecha_programada date,
	PRIMARY KEY(id_aula, id_horario, id_semana),
	FOREIGN KEY (id_aula) REFERENCES aula(id),
	FOREIGN KEY (id_horario) REFERENCES horario(id),
	FOREIGN KEY (id_semana) REFERENCES semana(id)
);
-- Se aplica un before insert/update para fijar la fecha_programada
-- coherente con el horario y la semana.
CREATE OR REPLACE FUNCTION set_fecha_programada()
RETURNS trigger AS $$
DECLARE
    v_fec_ini date;
    v_dia_sem char(2);
    v_offset integer;
BEGIN
    -- fecha inicial de la semana
    SELECT fec_ini INTO v_fec_ini
    FROM semana
    WHERE id = NEW.id_semana;

    -- día del horario
    SELECT dia_sem INTO v_dia_sem
    FROM horario
    WHERE id = NEW.id_horario;

    v_offset := CASE v_dia_sem
        WHEN 'LU' THEN 0
        WHEN 'MA' THEN 1
        WHEN 'MI' THEN 2
        WHEN 'JU' THEN 3
        WHEN 'VI' THEN 4
        WHEN 'SA' THEN 5
        ELSE NULL
    END;

    IF v_offset IS NULL THEN
        RAISE EXCEPTION 'Día inválido: %', v_dia_sem;
    END IF;

	--Fecha real.
    NEW.fecha_programada := v_fec_ini + v_offset * INTERVAL '1 day';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_fecha_programada
BEFORE INSERT OR UPDATE ON aula_horario_sem
FOR EACH ROW
EXECUTE FUNCTION set_fecha_programada();






CREATE TABLE IF NOT EXISTS festivo(
	id serial PRIMARY KEY,
	fecha date NOT NULL,
	descripcion text
);

CREATE TABLE IF NOT EXISTS estudiante(
	id serial PRIMARY KEY,
	codigo varchar(20) UNIQUE NOT NULL,
	nombre text NOT NULL,
	apellidos text NOT NULL,
	score_in numeric,
	score_out numeric,
	tipo_doc int NOT NULL,
	FOREIGN KEY (tipo_doc) REFERENCES tipoDocumento(id)
);

CREATE TABLE IF NOT EXISTS estudiante_aula(
	id_estudiante int,
	id_aula int,
	consec int,
	fecha_asignado date NOT NULL,
	fecha_desasignado date,
	PRIMARY KEY(id_estudiante, id_aula, consec),
	FOREIGN KEY (id_estudiante) REFERENCES estudiante(id),
	FOREIGN KEY (id_aula) REFERENCES aula(id)
);

CREATE TABLE IF NOT EXISTS tutor_aula(
	id_tutor int,
	id_aula int,
	consec int,
	fecha_asignado date NOT NULL,
	fecha_desasignado date,
	PRIMARY KEY(id_tutor, id_aula, consec),
	FOREIGN KEY (id_tutor) REFERENCES personal(id),
	FOREIGN KEY (id_aula) REFERENCES aula(id)
);

CREATE TABLE IF NOT EXISTS motivo(
	id serial PRIMARY KEY,
	descripcion text NOT NULL
);

CREATE TABLE IF NOT EXISTS asistenciaEst(
	id serial PRIMARY KEY,
	fecha_real date,
	presente boolean NOT NULL,
	id_estudiante int NOT NULL,
	id_aula int NOT NULL,
	id_horario int NOT NULL,
	id_semana int,
	FOREIGN KEY (id_estudiante) REFERENCES estudiante(id),
	FOREIGN KEY (id_aula) REFERENCES aula(id),
	FOREIGN KEY (id_horario) REFERENCES horario(id),
	FOREIGN KEY (id_semana) REFERENCES semana(id),
	UNIQUE (id_estudiante, id_aula, id_horario, fecha_real)
);

CREATE TABLE IF NOT EXISTS asistenciaTut(
	id serial PRIMARY KEY,
	fecha_real date,
	dictoClase boolean NOT NULL,
	fecha_reposicion date,
	id_tutor int NOT NULL,
	id_aula int NOT NULL,
	id_horario int NOT NULL,
	id_semana int,
	id_motivo int,
	FOREIGN KEY (id_tutor) REFERENCES personal(id),
	FOREIGN KEY (id_aula) REFERENCES aula(id),
	FOREIGN KEY (id_horario) REFERENCES horario(id),
	FOREIGN KEY (id_semana) REFERENCES semana(id),
	FOREIGN KEY (id_motivo) REFERENCES motivo(id),
	UNIQUE (id_tutor, id_aula, id_horario, fecha_real)
);

CREATE TABLE IF NOT EXISTS componente(
	id serial PRIMARY KEY,
	nombre text NOT NULL,
	tipo_programa int NOT NULL, --1: INSIDE, 2:OUTSIDE
	porcentaje numeric NOT NULL,
	id_periodo int NOT NULL,
	FOREIGN KEY (id_periodo) REFERENCES periodo(id),
	CHECK (tipo_programa IN (1, 2)),
	CHECK (porcentaje >= 0 AND porcentaje <= 100)
);

CREATE TABLE IF NOT EXISTS nota(
	id serial PRIMARY KEY,
	valor numeric NOT NULL,
	comentario text,
	id_tutor int NOT NULL,
	id_comp int NOT NULL,
	id_estudiante int NOT NULL,
	FOREIGN KEY (id_tutor) REFERENCES personal(id),
	FOREIGN KEY (id_comp) REFERENCES componente(id),
	FOREIGN KEY (id_estudiante) REFERENCES estudiante(id),
	CHECK (valor >= 0 AND valor <= 5),
	UNIQUE (id_estudiante, id_comp)
);