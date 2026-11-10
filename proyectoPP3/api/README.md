# Documentación de la API

API HTTP del sistema de gestión de recursos escolares. Está implementada con `node:http` y responde JSON salvo en los errores del despachador (401/403/404), que devuelven texto plano.

## Dirección base

La configuración está en `backend/configure/config.json`:

```
http://127.0.0.1:3000
```

## Convenciones

- Todas las rutas se invocan con **POST** y cuerpo JSON.
- Cabecera recomendada: `Content-Type: application/json`.
- El router solo compara la ruta, no el método HTTP, pero la documentación usa POST porque los handlers leen el cuerpo de la petición.
- CORS habilitado con `Access-Control-Allow-Origin: *`.
- `OPTIONS` responde `204` sin cuerpo.
- Una ruta inexistente responde `404` con el texto `Método no encontrado`.

## Autenticación

1. Se obtiene una sesión con `POST /login`.
2. La respuesta incluye `id` y `apiKey`.
3. Las rutas privadas requieren estas cabeceras:

```
x-user-id: <id>
x-api-key: <apiKey>
```

Si faltan o no coinciden: `401` con el texto `Sesión inválida`.
Si la sesión es válida pero el grupo no tiene permiso sobre la ruta: `403` con `Acceso denegado`.

Las sesiones viven en memoria: al reiniciar el servidor hay que volver a iniciar sesión.

### Rutas públicas

No piden sesión ni permisos a nivel de despachador:

- `POST /login`
- `POST /register`
- `POST /api/getAvailability`
- `POST /api/calendar/reservations`
- `POST /api/applyReservation`
- `POST /api/reservations/create`
- `POST /api/inventory/list`
- `POST /api/resources/create`
- `POST /api/resources/delete`

Aclaración: `resources/create` y `resources/delete` son públicas para el router, pero el handler igual exige sesión y permiso de administrador. Sin sesión devuelven `401`; con sesión sin permiso, `403`.

## Formato de respuesta

La mayoría de los handlers usan uno de estos sobres:

```json
{ "status": "success", "data": {} }
```

```json
{ "status": "success", "message": "Texto descriptivo" }
```

```json
{ "status": "error", "message": "Texto del error" }
```

Algunos endpoints administrativos usan `success` en lugar de `status`:

```json
{ "success": true, "data": {} }
```

`/login` tiene un formato propio, documentado en `auth.md`.

## Códigos de estado

| Código | Significado |
|---|---|
| 200 | Operación correcta |
| 204 | Preflight CORS |
| 400 | Datos inválidos o faltantes |
| 401 | Sin sesión o credenciales incorrectas |
| 403 | Sesión válida sin permiso |
| 404 | Ruta o recurso inexistente |
| 409 | Conflicto: ocupado, duplicado o préstamo existente |
| 500 | Error interno |

## Índice de endpoints

| Ruta | Autenticación | Documento |
|---|---|---|
| `/login` | Pública | `auth.md` |
| `/register` | Pública | `auth.md` |
| `/api/inventory/list` | Pública | `inventory.md` |
| `/api/resources/list` | Privada | `inventory.md` |
| `/api/resources/create` | Sesión + admin | `inventory.md` |
| `/api/resources/delete` | Sesión + admin | `inventory.md` |
| `/api/getAvailability` | Pública | `availability.md` |
| `/api/calendar/reservations` | Pública | `availability.md` |
| `/api/applyReservation` | Pública, con reglas por operación | `availability.md` |
| `/api/reservations/create` | Pública, con reglas por operación | `availability.md` |
| `/api/reservations/cancel` | Privada | `availability.md` |
| `/api/users` | Privada | `administration.md` |
| `/api/groups` | Privada | `administration.md` |
| `/api/admin/user/delete` | Privada | `administration.md` |
| `/api/user/edit` | Privada | `administration.md` |
| `/api/admin/group/create` | Privada | `administration.md` |
| `/api/admin/group/delete` | Privada | `administration.md` |
| `/api/admin/group/update` | Privada | `administration.md` |
| `/api/admin/permissions` | Privada | `administration.md` |
| `/api/admin/endpoint/create` | Privada | `administration.md` |
| `/api/admin/endpoint/delete` | Privada | `administration.md` |

## Permisos

El acceso se controla con las tablas `endpoint`, `access`, `members` y `group`. La ruta solicitada debe existir en `endpoint` y estar asociada al grupo del usuario.

`init-db.mjs` registra 34 endpoints y asigna todos al grupo `admin`. Las rutas `/api/users`, `/api/groups`, `/api/user/edit` y `/api/admin/*` **no están en esa lista inicial**, por lo que un administrador recibe `403` hasta que se agregue el endpoint y su permiso en la base.

Los alias comparten handler pero se autorizan por ruta exacta: por ejemplo `/api/inventory/list` es pública, mientras `/api/resources/list` requiere sesión y permiso.
