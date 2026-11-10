# Administración

Estas rutas requieren sesión válida y permiso sobre la ruta exacta.

## Aclaración sobre permisos

`init-db.mjs` registra 34 endpoints y asigna todos al grupo `admin`, pero **no incluye** estas rutas administrativas ni `/api/users`, `/api/groups`, `/api/user/edit`. Por eso, con la base recién inicializada, el administrador recibe `403` en ellas.

Para habilitarlas hay que insertar el path en `endpoint` y su acceso en `access`:

```sql
INSERT OR IGNORE INTO endpoint (path) VALUES ('/api/groups');
INSERT OR IGNORE INTO access (id_group, id_endpoint)
SELECT 1, id FROM endpoint WHERE path = '/api/groups';
```

Todas comparten el mismo patrón: si la ruta no existe en `endpoint` o el grupo no tiene `access`, el despachador responde `403`.

## POST /api/users

Lista usuarios.

### Cuerpo

`{}`

### Respuesta 200

```json
{
  "status": "success",
  "data": [
    { "id": 1, "username": "admin" }
  ]
}
```

## POST /api/groups

Lista grupos.

### Cuerpo

`{}`

### Respuesta 200

```json
{
  "status": "success",
  "data": [
    { "id": 1, "name": "admin" }
  ]
}
```

## POST /api/admin/user/delete

Elimina un usuario y sus membresías de grupo.

### Cuerpo

```json
{ "user_id": 2 }
```

### Respuesta 200

```json
{
  "status": "success",
  "data": {
    "message": "usuario eliminado",
    "changes": 1
  }
}
```

### Error

`500` con `{"status":"error","message":"..."}` si el ID no es válido o falla la base.

## POST /api/user/edit

Asigna un usuario a un grupo. Si ya tenía otro, lo reemplaza.

### Cuerpo

```json
{ "id_user": 2, "id_group": 3 }
```

### Respuesta 200

```json
{
  "status": "success",
  "data": {
    "message": "Usuario agregado al grupo con éxito",
    "changes": 1
  }
}
```

### Errores

| Código | Caso |
|---|---|
| 400 | `id_user` o `id_group` no numéricos |
| 500 | JSON inválido o error de base |

## POST /api/admin/group/create

### Cuerpo

```json
{ "name": "preceptor" }
```

### Respuesta 200

```json
{
  "status": "success",
  "data": { "id": 5, "name": "preceptor" }
}
```

### Error

`500` con `{"status":"error","message":"..."}` (por ejemplo, nombre duplicado).

## POST /api/admin/group/delete

Elimina el grupo, sus membresías y sus permisos.

### Cuerpo

```json
{ "id": 5 }
```

### Respuesta 200

```json
{
  "status": "success",
  "data": { "message": "grupo eliminado", "changes": 1 }
}
```

## POST /api/admin/group/update

### Cuerpo

```json
{ "id": 5, "name": "preceptor" }
```

### Respuesta 200

```json
{
  "status": "success",
  "data": { "message": "grupo actualizado" }
}
```

## POST /api/admin/permissions

Agrega un permiso de un grupo sobre un endpoint existente.

### Cuerpo

```json
{
  "group_name": "profesor",
  "endpoint": "/api/inventory/list"
}
```

### Respuesta 200

```json
{ "success": true, "message": "Permiso agregado" }
```

### Errores

| Código | Caso | Respuesta |
|---|---|---|
| 404 | Grupo inexistente | `{"error":"Grupo no encontrado"}` |
| 404 | Endpoint inexistente | `{"error":"Endpoint no encontrado"}` |
| 500 | Error interno | `{"error":"..."}` |

## POST /api/admin/endpoint/create

Registra una ruta en la tabla `endpoint`. No otorga permisos por sí sola.

### Cuerpo

```json
{ "path": "/api/groups" }
```

### Respuesta 200

```json
{
  "success": true,
  "data": { "id": 35, "path": "/api/groups" }
}
```

Si ya existía:

```json
{
  "success": true,
  "data": { "message": "El endpoint ya existe" }
}
```

### Errores

| Código | Caso |
|---|---|
| 400 | Falta `path` |
| 500 | Error interno |

## POST /api/admin/endpoint/delete

Elimina el endpoint y todos sus permisos.

### Cuerpo

```json
{ "endpoint_id": 35 }
```

### Respuesta 200

```json
{
  "success": true,
  "data": { "message": "Endpoint eliminado", "changes": 1 }
}
```

### Error

| Código | Caso |
|---|---|
| 400 | `endpoint_id` no numérico |
| 500 | Error interno |

## Rutas de diagnóstico

`/log` y `/sayHello` existen en el router y devuelven:

```json
{ "success": true, "message": "Endpoint /log ejecutado correctamente" }
```

Pero no están en la lista pública ni en la tabla `endpoint`, así que en la práctica responden `403` para cualquier sesión.
