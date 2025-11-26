# Backend - NestJS API

API REST desarrollada con NestJS, PostgreSQL y autenticación JWT.

## Inicio Rápido

### Prerequisitos
- Docker y Docker Compose
- Node.js 25+

### Levantar el proyecto

Desde el **root del monorepo**:

Duplicar .env.example, renombrarlo como .env y asignar valores

```bash
docker-compose up
```

Esto iniciará:
- PostgreSQL en puerto `5432`
- Backend en puerto `3000`
- Ejecutará automáticamente scripts SQL desde `sql/init/`

### Configurar datos iniciales (Seed)

```bash
# Dentro del contenedor o localmente
npm run dev

# Luego hacer POST a:
POST http://localhost:3000/seed
```

Esto creará los usuarios de prueba:
- **administrador** / `admin123`
- **tutor1** / `tutor123`
- **tutor2** / `tutor123`

---

## Autenticación

### 1. Obtener token

```bash
POST /auth/login
Content-Type: application/json

{
  "usuario": "administrador",
  "contrasena": "admin123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { ... }
}
```

### 2. Usar el token

Agregar en headers de las peticiones protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Decorador `@Auth()`

Este proyecto usa un decorador personalizado para proteger rutas:

```typescript
import { Auth } from './auth/decorators';
import { ValidRoles } from './auth/interfaces';

// Ruta protegida - cualquier usuario autenticado
@Get()
@Auth()
getProfile() { ... }

// Ruta solo para ADMINISTRADOR
@Post()
@Auth(ValidRoles.ADMINISTRADOR)
create() { ... }

// Múltiples roles permitidos
@Put(':id')
@Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
update() { ... }
```

**¿Qué hace el decorador `@Auth()`?**
- ✅ Valida el JWT token
- ✅ Verifica que el usuario tenga alguno de los roles especificados
- ✅ Documenta automáticamente en Swagger (Bearer Auth, respuestas 401/403)
- ✅ Inyecta el usuario autenticado en el request

**Roles disponibles:**
- `ValidRoles.ADMINISTRADOR`
- `ValidRoles.ADMINISTRATIVO`
- `ValidRoles.TUTOR`

---

## Base de Datos

### Inicialización automática

Los scripts en `sql/init/` se ejecutan en orden al levantar Docker:

```
sql/
└── init/
    ├── 01_schema.sql
    ├── 02_fn_utils.sql
    ├── 03_sp_asignaciones.sql
    ├──...
```

> **Nota:** Usamos `SERIAL` para auto-incremento en la mayoría de ids. PostgreSQL maneja los IDs automáticamente.

---

## Documentación API (Swagger)

### Acceder a Swagger UI

```
http://localhost:3000/api
```
Documentar endpoints, dtos y 