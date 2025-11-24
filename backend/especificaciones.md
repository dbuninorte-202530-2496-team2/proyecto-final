# GlobalEnglish API - Especificación del Sistema

## Descripción General
Sistema para gestionar el programa de educación bilingüe GlobalEnglish con dos subprogramas:
- **InsideClassroom**: Grados 4° y 5° (dentro del horario escolar)
- **OutsideClassroom**: Grados 9° y 10° (fuera del horario escolar)

---

## Módulos y Endpoints

### 1. **AUTH** - Autenticación
```
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
GET    /auth/me
```

**DTOs:**
```typescript
LoginDto {
  usuario: string;
  contrasena: string;
}

AuthResponseDto {
  token: string;
  usuario: string;
  rol: string;
  personal_id: number;
}
```

---

### 2. **ROLES** - Gestión de Roles
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
  id: number;
  nombre: string;  // 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR'
  descripcion?: string;
}
```

---

### 3. **USUARIOS** - Gestión de Usuarios
```
GET    /usuarios                    [ADMINISTRADOR]
GET    /usuarios/:usuario           [ADMINISTRADOR]
POST   /usuarios                    [ADMINISTRADOR]
PUT    /usuarios/:usuario           [ADMINISTRADOR]
DELETE /usuarios/:usuario           [ADMINISTRADOR]
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
  codigo: string;
  nombre: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  id_rol: number;
  usuario?: string;
  tipo_doc: number;
}
```

---

### 5. **INSTITUCIONES** - Gestión de IED
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
  telefono_contacto?: string;
}
```

---

### 6. **SEDES** - Gestión de Sedes
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

### 7. **AULAS** - Gestión de Aulas
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
AulaDto {
  id: number;
  grado: number;
  grupo: number;
  id_sede: number;
  tipo_programa: 'INSIDECLASSROOM' | 'OUTSIDECLASSROOM';  // calculado según grado
}
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
  hora_fin: string;
}
```

---

### 9. **PERIODOS Y SEMANAS** - Gestión de Calendario
```
GET    /periodos
GET    /periodos/:id
POST   /periodos              [ADMINISTRADOR]
GET    /periodos/:id/semanas
POST   /periodos/:id/generar-semanas  [ADMINISTRADOR]
```

**DTOs:**
```typescript
CreatePeriodoDto {
  anho: number;
}

GenerarSemanasDto {
  fecha_inicio: string;  // 'YYYY-MM-DD'
  cantidad_semanas: number;
}
```

---

### 10. **AULA-HORARIO** - Asignación de Horarios a Aulas
```
GET    /aulas/:id_aula/horarios
POST   /aulas/:id_aula/horarios           [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /aulas/:id_aula/horarios/:id_horario  [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
AsignarHorarioAulaDto {
  id_horario: number;
  id_semana: number;  // semana desde la cual aplica
}
```

---

### 11. **TUTOR-AULA** - Asignación de Tutores
```
GET    /aulas/:id_aula/tutores-asignados
POST   /aulas/:id_aula/tutores            [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /aulas/:id_aula/tutores/:id_tutor/desasignar  [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
AsignarTutorDto {
  id_tutor: number;
  fecha_asignado: string;  // 'YYYY-MM-DD'
}

DesasignarTutorDto {
  fecha_desasignado: string;
}
```

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
  codigo: string;
  nombre: string;
  apellidos: string;
  tipo_doc: number;
}

UpdateScoresDto {
  score_in?: number;
  score_out?: number;
}
```

---

### 13. **ESTUDIANTE-AULA** - Asignación de Estudiantes a Aulas
```
GET    /estudiantes/:id_estudiante/aulas-historico
POST   /estudiantes/:id_estudiante/aulas  [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /estudiantes/:id_estudiante/aulas/:id_aula/mover  [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
AsignarEstudianteAulaDto {
  id_aula: number;
  fecha_asignado: string;
}

MoverEstudianteDto {
  id_aula_destino: number;
  fecha_desasignado: string;
}
```

---

### 14. **ASISTENCIA ESTUDIANTES** - Registro de Asistencia
```
GET    /asistencia-estudiantes
GET    /aulas/:id_aula/asistencia
POST   /asistencia-estudiantes    [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
PUT    /asistencia-estudiantes/:id  [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
GET    /estudiantes/:id/asistencia
```

**DTOs:**
```typescript
CreateAsistenciaEstDto {
  fecha_real: string;
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

---

### 15. **ASISTENCIA TUTORES** - Registro de Asistencia de Tutores
```
GET    /asistencia-tutores
POST   /asistencia-tutores        [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
PUT    /asistencia-tutores/:id    [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
GET    /tutores/:id/asistencia    [TUTOR para sí mismo, ADMINISTRATIVO, ADMINISTRADOR]
PUT    /asistencia-tutores/:id/reposicion  [TUTOR, ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateAsistenciaTutDto {
  fecha_real: string;
  dictoClase: boolean;
  id_tutor: number;
  id_aula: number;
  id_horario: number;
  id_semana: number;
  id_motivo?: number;  // requerido si dictoClase = false
}

RegistrarReposicionDto {
  fecha_reposicion: string;
}
```

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

---

### 17. **FESTIVOS** - Gestión de Festivos
```
GET    /festivos
GET    /festivos/:id
POST   /festivos              [ADMINISTRATIVO, ADMINISTRADOR]
PUT    /festivos/:id          [ADMINISTRATIVO, ADMINISTRADOR]
DELETE /festivos/:id          [ADMINISTRATIVO, ADMINISTRADOR]
```

**DTOs:**
```typescript
CreateFestivoDto {
  fecha: string;  // 'YYYY-MM-DD'
  descripcion?: string;
}
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

---

### 19. **NOTAS** - Gestión de Notas
```
GET    /notas
GET    /estudiantes/:id/notas
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
  id: number;
  codigo: string;        // max 11 chars
  descripcion?: string;
}
```

---

### 21. **REPORTES** - Generación de Reportes

```
GET    /reportes/asistencia-aula/:id_aula?semana_inicio=X&semana_fin=Y
GET    /reportes/asistencia-estudiante/:id_estudiante?fecha_inicio=X&fecha_fin=Y
GET    /reportes/boletin/:id_estudiante/:id_periodo
GET    /reportes/tutor-autogestion/:id_tutor?fecha_inicio=X&fecha_fin=Y
GET    /reportes/notas-tutor/:id_tutor?semana_inicio=X&semana_fin=Y
```

**Response Types:**
```typescript
ReporteAsistenciaAulaDto {
  aula: { id, grado, grupo, sede, institucion };
  semanas: Array<{
    semana: number;
    fecha_inicio: string;
    fecha_fin: string;
    clases: Array<{
      fecha_real: string;
      dia_semana: string;
      hora_inicio: string;
      hora_fin: string;
      tutor: string;
      es_festivo: boolean;
      dicto_clase: boolean;
      horas_dictadas: number;
      horas_no_dictadas: number;
      motivo?: string;
      fecha_reposicion?: string;
    }>;
  }>;
}

ReporteAsistenciaEstudianteDto {
  estudiante: { id, codigo, nombre, apellidos };
  detalle: Array<{
    fecha_real: string;
    aula: { grado, grupo };
    horario: { dia, hora_ini, hora_fin };
    presente: boolean;
    tutor_dicto_clase: boolean;
  }>;
}

BoletinCalificacionesDto {
  estudiante: { id, codigo, nombre, apellidos };
  institucion: string;
  grado: number;
  tipo_programa: string;
  periodo: number;
  componentes: Array<{
    nombre: string;
    porcentaje: number;
    nota: number;
    nota_ponderada: number;
  }>;
  nota_definitiva: number;
}
```

---

## Arquitectura de Módulos NestJS

```
src/
├── auth/
├── roles/
├── usuarios/
├── personal/
├── instituciones/
├── sedes/
├── aulas/
├── horarios/
├── periodos/
├── estudiantes/
├── asistencia-estudiantes/
├── asistencia-tutores/
├── motivos/
├── festivos/
├── componentes/
├── notas/
├── tipos-documento/
├── reportes/
├── database/
│   └── database.module.ts
└── common/
    ├── guards/
    │   └── roles.guard.ts
    ├── decorators/
    │   └── roles.decorator.ts
    └── filters/
```

---

## Guards y Permisos

```typescript
// Decorador personalizado
@Roles('ADMINISTRADOR', 'ADMINISTRATIVO')
@UseGuards(AuthGuard, RolesGuard)
async create() { ... }

// Jerarquía de permisos:
ADMINISTRADOR > ADMINISTRATIVO > TUTOR
```

---

## Validaciones Importantes

1. **Asignación de estudiantes**: Solo pueden moverse entre aulas del mismo nivel (4°-5° o 9°-10°)
2. **Horarios**: Los componentes de nota deben sumar 100% por tipo_programa y periodo
3. **Notas**: Solo una nota por estudiante y componente (UNIQUE constraint)
4. **Asistencia**: No duplicar registros (UNIQUE constraints)
5. **Tutores**: Validar que `id_tutor` en Personal tenga `id_rol` = TUTOR

---

## Variables de Entorno

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=globalenglish
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
```