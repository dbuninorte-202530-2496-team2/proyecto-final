CREATE TABLE IF NOT EXISTS rol(
	id serial PRIMARY KEY, --serial maneja sequences internas
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
	id_sede int NOT NULL,
	FOREIGN KEY (id_sede) REFERENCES sede(id),
	CHECK (grado IN (4, 5, 9, 10))
);

CREATE TABLE IF NOT EXISTS horario(
	id serial PRIMARY KEY,
	dia_sem char(2) NOT NULL,
	hora_ini time NOT NULL,
	hora_fin time NOT NULL,
	CHECK (dia_sem IN ('LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'))
);

CREATE TABLE IF NOT EXISTS periodo(
	id serial PRIMARY KEY,
	anho int NOT NULL
);

CREATE TABLE IF NOT EXISTS semana(
	id serial PRIMARY KEY,
	fec_ini date NOT NULL,
	fec_fin date GENERATED ALWAYS AS (fec_ini + INTERVAL '6 days') STORED,
	id_periodo int NOT NULL,
	FOREIGN KEY (id_periodo) REFERENCES periodo(id)
);

CREATE TABLE IF NOT EXISTS aula_horario_sem(
	id_aula int,
	id_horario int,
	id_semana int,
	PRIMARY KEY(id_aula, id_horario, id_semana),
	FOREIGN KEY (id_aula) REFERENCES aula(id),
	FOREIGN KEY (id_horario) REFERENCES horario(id),
	FOREIGN KEY (id_semana) REFERENCES semana(id)
);

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
	tipo_programa int NOT NULL,
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