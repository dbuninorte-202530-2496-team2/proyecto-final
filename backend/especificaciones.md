# GlobalEnglish API - Especificación del Sistema

## Descripción General
Sistema para gestionar el programa de educación bilingüe GlobalEnglish con dos subprogramas:
- **InsideClassroom**: Grados 4° y 5° (dentro del horario escolar)
- **OutsideClassroom**: Grados 9° y 10° (fuera del horario escolar)

---

## Módulos y Endpoints Implementados

### 1. **AUTH** - Autenticación ✅
```
POST   /auth/login
GET    /auth/check-status
GET    /auth/me
```

**DTOs:**
```typescript
LoginUsuarioDto {
  usuario: string;
  contrasena: string;
}

// Response incluye JWT token
```

---

### 2. **ROLES** - Gestión de Roles ✅
```
GET    /roles
GET    /roles/:id
POST   /roles              [ADMINISTRADOR]
PUT    /roles/:id          [ADMINISTRADOR]
DELETE /roles/:id          [ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateRolDto {
  nombre: string;
  descripcion?: string;
}
```

---

### 3. **USUARIOS** - Gestión de Usuarios
```
GET    /usuarios                         [ADMINISTRADOR]
GET    /usuarios/:usuario                [ADMINISTRADOR]
POST   /usuarios                         [ADMINISTRADOR]
PUT    /usuarios/:usuario                [ADMINISTRADOR]
DELETE /usuarios/:usuario                [ADMINISTRADOR]
POST   /usuarios/:usuario/send-password  [ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateUsuarioDto {
  usuario: string;
  contrasena: string;
}
```

---

### 4. **PERSONAL** - Gestión de Personal
```
GET    /personal
GET    /personal/:id
POST   /personal              [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /personal/:id          [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /personal/:id          [ADMINISTRATIVO, ADMINISTRADOR]
GET    /personal/tutores      [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreatePersonalDto {
  codigo: string;         // max 20 chars, unique
  nombre: string;
  apellido?: string;
  correo?: string;
  telefono?: string;      // max 20 chars
  id_rol: number;         // FK a rol
  usuario?: string;       // FK a usuario, unique, optional
  tipo_doc: number;       // FK a tipoDocumento
}
```

**Tabla SQL:**
```sql
CREATE TABLE personal(
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
```

---

### 5. **INSTITUCIONES** - Gestión de IED ✅
```
GET    /instituciones
GET    /instituciones/:id
POST   /instituciones         [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /instituciones/:id     [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /instituciones/:id     [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateInstitucionDto {
  nombre: string;
  correo?: string;
  jornada: 'MAÑANA' | 'TARDE' | 'UNICA' | 'MIXTA';
  nombre_contacto?: string;
  telefono_contacto?: string;  // max 20 chars
}
```

---

### 6. **SEDES** - Gestión de Sedes ✅
```
GET    /sedes
GET    /sedes/:id
GET    /instituciones/:id_inst/sedes
POST   /sedes                 [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /sedes/:id             [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /sedes/:id             [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateSedeDto {
  nombre: string;
  direccion?: string;
  id_inst: number;
  is_principal: boolean;
}
```

---

### 7. **AULAS** - Gestión de Aulas ✅
```
GET    /aulas
GET    /aulas/:id
GET    /sedes/:id_sede/aulas
POST   /aulas                 [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /aulas/:id             [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /aulas/:id             [ADMINISTRATIVO, ADMINISTRADOR]
GET    /aulas/:id/estudiantes
GET    /aulas/:id/tutores-historico
```

**DTOs:**
```typescript
CreateAulaDto {
  grado: 4 | 5 | 9 | 10;
  grupo: number;
  id_sede: number;
}

// Computed property en el GET
AulaEntity {
  id: number;
  grado: number;
  grupo: number;
  id_sede: number;
  tipo_programa: 'INSIDECLASSROOM' | 'OUTSIDECLASSROOM';  // calculado según grado
  sede_nombre?: string;
  institucion_nombre?: string;
}
```

**Tabla SQL:**
```sql
CREATE TABLE aula(
  id serial PRIMARY KEY,
  grado int NOT NULL,
  grupo int NOT NULL,
  id_sede int NOT NULL,
  FOREIGN KEY (id_sede) REFERENCES sede(id),
  CHECK (grado IN (4, 5, 9, 10))
);
```

---

### 8. **HORARIOS** - Gestión de Horarios
```
GET    /horarios
GET    /horarios/:id
POST   /horarios              [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /horarios/:id          [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /horarios/:id          [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateHorarioDto {
  dia_sem: 'LU' | 'MA' | 'MI' | 'JU' | 'VI' | 'SA' | 'DO';
  hora_ini: string;  // formato: 'HH:mm:ss'
  hora_fin: string;  // formato: 'HH:mm:ss'
}
```

**Tabla SQL:**
```sql
CREATE TABLE horario(
  id serial PRIMARY KEY,
  dia_sem char(2) NOT NULL,
  hora_ini time NOT NULL,
  hora_fin time NOT NULL,
  CHECK (dia_sem IN ('LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'))
);
```

**Nota:** Los horarios pueden ser de 40, 45, 50, 55 o 60 minutos (equivalente a 1 hora según gestión).

---

### 9. **PERIODOS Y SEMANAS** - Gestión de Calendario
```
GET    /periodos
GET    /periodos/:id
POST   /periodos                          [ADMINISTRADOR]
PUT    /periodos/:id                      [ADMINISTRADOR]
DELETE /periodos/:id                      [ADMINISTRADOR]
GET    /periodos/:id/semanas
POST   /periodos/:id/generar-semanas      [ADMINISTRADOR]
```

**DTOs:**
```typescript
CreatePeriodoDto {
  anho: number;
}

GenerarSemanasDto {
  fec_ini: string;         // 'YYYY-MM-DD' - fecha inicio de la primera semana
  cantidad_semanas: number;
}
```

**Tablas SQL:**
```sql
CREATE TABLE periodo(
  id serial PRIMARY KEY,
  anho int NOT NULL
);

CREATE TABLE semana(
  id serial PRIMARY KEY,
  fec_ini date NOT NULL,
  fec_fin date GENERATED ALWAYS AS (fec_ini + INTERVAL '6 days') STORED,
  id_periodo int NOT NULL,
  FOREIGN KEY (id_periodo) REFERENCES periodo(id)
);
```

**Importante:** `fec_fin` se calcula automáticamente como `fec_ini + 6 días`.

---

### 10. **AULA-HORARIO-SEMANA** - Asignación de Horarios a Aulas
```
GET    /aulas/:id_aula/horarios
POST   /aulas/:id_aula/horarios                           [ADMINISTRATIVO, ADMINISTRADOR]
POST   /aulas/:id_aula/horarios/sesion-especifica         [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /aulas/:id_aula/horarios/:id_horario/:id_semana    [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
AsignarHorarioAulaDto {
  id_horario: number;
  id_semana: number;  // semana desde la cual aplica el horario
}

// Para crear una sesión en fecha específica (ej: reposiciones)
CrearSesionEspecificaDto {
  id_horario: number;
  fecha: string;      // 'YYYY-MM-DD' - se calcula automáticamente a qué semana pertenece
}
```

**Tabla SQL:**
```sql
CREATE TABLE aula_horario_sem(
  id_aula int,
  id_horario int,
  id_semana int,
  PRIMARY KEY(id_aula, id_horario, id_semana),
  FOREIGN KEY (id_aula) REFERENCES aula(id),
  FOREIGN KEY (id_horario) REFERENCES horario(id),
  FOREIGN KEY (id_semana) REFERENCES semana(id)
);
```

**Nota Crítica:** 
- Los horarios se asignan **por semana**. 
- Para reposiciones, se crea una entrada específica con la semana correspondiente a la fecha de reposición.
- El sistema calcula automáticamente `id_semana` a partir de la fecha proporcionada.
- Una vez creada, funciona como cualquier otra sesión (no se distingue que es reposición).

---

### 11. **TUTOR-AULA** - Asignación de Tutores
```
GET    /aulas/:id_aula/tutores-actuales
GET    /aulas/:id_aula/tutores-historico
POST   /aulas/:id_aula/tutores                    [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /aulas/:id_aula/tutores/:id_tutor/desasignar  [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
AsignarTutorDto {
  id_tutor: number;           // FK a personal (debe tener id_rol = TUTOR)
  fecha_asignado: string;     // 'YYYY-MM-DD'
}

DesasignarTutorDto {
  fecha_desasignado: string;  // 'YYYY-MM-DD'
}
```

**Tabla SQL:**
```sql
CREATE TABLE tutor_aula(
  id_tutor int,
  id_aula int,
  consec int,
  fecha_asignado date NOT NULL,
  fecha_desasignado date,
  PRIMARY KEY(id_tutor, id_aula, consec),
  FOREIGN KEY (id_tutor) REFERENCES personal(id),
  FOREIGN KEY (id_aula) REFERENCES aula(id)
);
```

**Importante:** `consec` es un consecutivo para permitir que un tutor pueda ser asignado múltiples veces a la misma aula en diferentes periodos.

---

### 12. **ESTUDIANTES** - Gestión de Estudiantes
```
GET    /estudiantes
GET    /estudiantes/:id
POST   /estudiantes           [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /estudiantes/:id       [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /estudiantes/:id       [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /estudiantes/:id/scores  [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateEstudianteDto {
  codigo: string;        // max 20 chars, unique
  nombre: string;
  apellidos: string;
  tipo_doc: number;      // FK a tipoDocumento
}

UpdateScoresDto {
  score_in?: number;     // score de entrada
  score_out?: number;    // score de salida
}
```

**Tabla SQL:**
```sql
CREATE TABLE estudiante(
  id serial PRIMARY KEY,
  codigo varchar(20) UNIQUE NOT NULL,
  nombre text NOT NULL,
  apellidos text NOT NULL,
  score_in numeric,
  score_out numeric,
  tipo_doc int NOT NULL,
  FOREIGN KEY (tipo_doc) REFERENCES tipoDocumento(id)
);
```

---

### 13. **ESTUDIANTE-AULA** - Asignación de Estudiantes a Aulas
```
GET    /estudiantes/:id_estudiante/aulas-historico
POST   /estudiantes/:id_estudiante/aulas           [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /estudiantes/:id_estudiante/aulas/mover     [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
AsignarEstudianteAulaDto {
  id_aula: number;
  fecha_asignado: string;  // 'YYYY-MM-DD'
}

MoverEstudianteDto {
  id_aula_destino: number;
  fecha_desasignado: string;  // 'YYYY-MM-DD'
}
```

**Tabla SQL:**
```sql
CREATE TABLE estudiante_aula(
  id_estudiante int,
  id_aula int,
  consec int,
  fecha_asignado date NOT NULL,
  fecha_desasignado date,
  PRIMARY KEY(id_estudiante, id_aula, consec),
  FOREIGN KEY (id_estudiante) REFERENCES estudiante(id),
  FOREIGN KEY (id_aula) REFERENCES aula(id)
);
```

**Restricción de Negocio:** Un estudiante solo puede moverse entre aulas de grados 4-5 o entre aulas de grados 9-10 (no se pueden mezclar primaria con secundaria).

---

### 14. **ASISTENCIA ESTUDIANTES** - Registro de Asistencia
```
GET    /asistencia-estudiantes
GET    /aulas/:id_aula/asistencia
POST   /asistencia-estudiantes         [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
PUT    /asistencia-estudiantes/:id     [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
GET    /estudiantes/:id/asistencia
POST   /asistencia-estudiantes/masiva  [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateAsistenciaEstDto {
  fecha_real: string;     // 'YYYY-MM-DD'
  presente: boolean;
  id_estudiante: number;
  id_aula: number;
  id_horario: number;
  id_semana: number;
}

// Para tomar asistencia masiva de un aula
TomarAsistenciaAulaDto {
  fecha_real: string;
  id_aula: number;
  id_horario: number;
  id_semana: number;
  asistencias: Array<{
    id_estudiante: number;
    presente: boolean;
  }>;
}
```

**Tabla SQL:**
```sql
CREATE TABLE asistenciaEst(
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
```

**Validaciones de Negocio:**
1. Antes de permitir tomar asistencia, validar que el tutor dictó clase (`asistenciaTut.dictoClase = true`)
2. Si el tutor no dictó clase, **bloquear** la toma de asistencia de estudiantes
3. Las reposiciones son sesiones normales (nueva entrada en `aula_horario_sem`), por lo tanto se toma asistencia normal

---

### 15. **ASISTENCIA TUTORES** - Registro de Asistencia de Tutores
```
GET    /asistencia-tutores
POST   /asistencia-tutores                    [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
PUT    /asistencia-tutores/:id                [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
GET    /tutores/:id/asistencia                [TUTOR para sí mismo, ADMINISTRATIVO, ADMINISTRADOR]
PUT    /asistencia-tutores/:id/reposicion    [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateAsistenciaTutDto {
  fecha_real: string;      // 'YYYY-MM-DD'
  dictoClase: boolean;
  id_tutor: number;
  id_aula: number;
  id_horario: number;
  id_semana: number;
  id_motivo?: number;      // requerido si dictoClase = false
}

RegistrarReposicionDto {
  fecha_reposicion: string;  // 'YYYY-MM-DD'
  // Nota: El admin debe crear manualmente el aula_horario_sem para esta fecha
  // o usar POST /aulas/:id_aula/horarios/sesion-especifica
}
```

**Tabla SQL:**
```sql
CREATE TABLE asistenciaTut(
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
```

**Flujo de Reposición:**
1. Tutor no dicta clase: `dictoClase = false`, registra `id_motivo`
2. Sistema **bloquea** toma de asistencia de estudiantes para esa sesión
3. Tutor/Admin registra `fecha_reposicion` en `asistenciaTut`
4. Admin crea sesión en `aula_horario_sem` para esa fecha usando `POST /aulas/:id_aula/horarios/sesion-especifica`
5. En la fecha de reposición, funciona como sesión normal
6. Tutor registra asistencia normal (nueva entrada en `asistenciaTut` con `dictoClase = true`)
7. Estudiantes toman asistencia normalmente

---

### 16. **MOTIVOS** - Motivos de Inasistencia
```
GET    /motivos
GET    /motivos/:id
POST   /motivos               [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /motivos/:id           [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /motivos/:id           [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateMotivoDto {
  descripcion: string;
}
```

**Tabla SQL:**
```sql
CREATE TABLE motivo(
  id serial PRIMARY KEY,
  descripcion text NOT NULL
);
```

---

### 17. **FESTIVOS** - Gestión de Festivos
```
GET    /festivos
GET    /festivos/:id
POST   /festivos              [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /festivos/:id          [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /festivos/:id          [ADMINISTRATIVO, ADMINISTRADOR]
GET    /festivos/fecha/:fecha
```

**DTOs:**
```typescript
CreateFestivoDto {
  fecha: string;        // 'YYYY-MM-DD'
  descripcion?: string;
}
```

**Tabla SQL:**
```sql
CREATE TABLE festivo(
  id serial PRIMARY KEY,
  fecha date NOT NULL,
  descripcion text
);
```

---

### 18. **COMPONENTES** - Componentes de Evaluación
```
GET    /componentes
GET    /periodos/:id_periodo/componentes
POST   /componentes           [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /componentes/:id       [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /componentes/:id       [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateComponenteDto {
  nombre: string;
  tipo_programa: 1 | 2;  // 1=INSIDECLASSROOM, 2=OUTSIDECLASSROOM
  porcentaje: number;    // 0-100
  id_periodo: number;
}
```

**Tabla SQL:**
```sql
CREATE TABLE componente(
  id serial PRIMARY KEY,
  nombre text NOT NULL,
  tipo_programa int NOT NULL,
  porcentaje numeric NOT NULL,
  id_periodo int NOT NULL,
  FOREIGN KEY (id_periodo) REFERENCES periodo(id),
  CHECK (tipo_programa IN (1, 2)),
  CHECK (porcentaje >= 0 AND porcentaje <= 100)
);
```

**Validación Crítica:** Los componentes de un periodo y tipo_programa deben sumar exactamente 100%.

---

### 19. **NOTAS** - Gestión de Notas
```
GET    /notas
GET    /estudiantes/:id/notas
GET    /estudiantes/:id/notas/periodo/:id_periodo
POST   /notas                 [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
PUT    /notas/:id             [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
DELETE /notas/:id             [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateNotaDto {
  valor: number;         // 0-5
  comentario?: string;
  id_tutor: number;
  id_comp: number;
  id_estudiante: number;
}
```

**Tabla SQL:**
```sql
CREATE TABLE nota(
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
```

**Restricción:** Solo puede existir una nota por estudiante y componente.

---

### 20. **TIPOS DE DOCUMENTO** - Catálogo
```
GET    /tipos-documento
GET    /tipos-documento/:id
POST   /tipos-documento       [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /tipos-documento/:id   [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /tipos-documento/:id   [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateTipoDocumentoDto {
  codigo: string;        // max 11 chars
  descripcion?: string;
}
```

**Tabla SQL:**
```sql
CREATE TABLE tipoDocumento(
  id serial PRIMARY KEY,
  codigo varchar(11) NOT NULL,
  descripcion text
);
```

---

### 21. **REPORTES** - Generación de Reportes

```
GET    /reportes/asistencia-aula/:id_aula?semana_inicio=X&semana_fin=Y          [ADMINISTRATIVO, ADMINISTRADOR]
GET    /reportes/asistencia-estudiante/:id_estudiante?fecha_inicio=X&fecha_fin=Y  [ADMINISTRATIVO, ADMINISTRADOR]
GET    /reportes/boletin/:id_estudiante/:id_periodo                             [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
GET    /reportes/tutor-autogestion/:id_tutor?fecha_inicio=X&fecha_fin=Y         [TUTOR para sí mismo, ADMINISTRATIVO, ADMINISTRADOR]
GET    /reportes/notas-tutor/:id_tutor?semana_inicio=X&semana_fin=Y             [TUTOR para sí mismo, ADMINISTRATIVO, ADMINISTRADOR]
```

---

## Estado de Implementación

| Módulo | Estado | Notas |
|--------|--------|-------|
| Auth | ✅ Implementado | Login, check-status, me |
| Roles | ✅ Implementado | CRUD completo |
| Usuarios | ⏳ Pendiente | |
| Personal | ⏳ Pendiente | |
| Instituciones | ✅ Implementado | CRUD completo |
| Sedes | ✅ Implementado | CRUD + by institución |
| Aulas | ✅ Implementado | CRUD + computed tipo_programa |
| Horarios | ⏳ Pendiente | |
| Periodos/Semanas | ⏳ Pendiente | |
| Aula-Horario-Semana | ⏳ Pendiente | **Clave: es por semana** |
| Tutor-Aula | ⏳ Pendiente | |
| Estudiantes | ⏳ Pendiente | |
| Estudiante-Aula | ⏳ Pendiente | |
| Asistencia Estudiantes | ⏳ Pendiente | |
| Asistencia Tutores | ⏳ Pendiente | |
| Motivos | ⏳ Pendiente | |
| Festivos | ⏳ Pendiente | |
| Componentes | ⏳ Pendiente | |
| Notas | ⏳ Pendiente | |
| Tipos Documento | ⏳ Pendiente | |
| Reportes | ⏳ Pendiente | |

---

## Validaciones Importantes del Negocio

1. **Asignación de estudiantes**: Solo pueden moverse entre aulas del mismo nivel (4°-5° o 9°-10°)
2. **Horarios por semana**: Los horarios se asignan desde una semana específica
3. **Componentes**: Deben sumar 100% por tipo_programa y periodo
4. **Notas**: Solo una nota por estudiante y componente (UNIQUE constraint)
5. **Asistencia**: No duplicar registros (UNIQUE constraints)
6. **Tutores**: Validar que `id_tutor` en Personal tenga `id_rol` = TUTOR
7. **Históricos**: `consec` permite múltiples asignaciones del mismo tutor/estudiante a la misma aula

---

## Variables de Entorno

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=globalenglish
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
```