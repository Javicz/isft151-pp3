# Autenticación y registro

## POST /login

Inicia sesión y devuelve la sesión en memoria con su `apiKey`.

### Cuerpo

```json
{
  "username": "admin",
  "password": "admin"
}
```

### Respuesta 200

```json
{
  "status": true,
  "result": {
    "id": 1,
    "username": "admin",
    "apiKey": "3f2a9c1e-...",
    "groups": [
      { "id": 1, "name": "admin" }
    ]
  },
  "description": "LOGIN_OK"
}
```

### Respuesta 401

```json
{
  "exception": "INVALID_USER_PASS",
  "detail": []
}
```

### Notas

- Si el usuario ya tenía una sesión, se reutiliza la misma `apiKey`.
- La sesión se guarda en memoria con estado `enabled`.
- Si el JSON es inválido o falta un campo, responde `500` con el mensaje del error.

## POST /register

Registra un usuario nuevo en el grupo `profesor`.

### Cuerpo

```json
{
  "username": "profesor1",
  "password": "clave123"
}
```

### Respuesta 200

```json
{
  "status": "ok",
  "data": {
    "id": 2,
    "username": "profesor1",
    "group": "profesor"
  }
}
```

### Errores

| Código | Caso | Respuesta |
|---|---|---|
| 400 | Usuario o contraseña ausentes | `{"status":"error","message":"Ingresá usuario y contraseña"}` |
| 400 | Usuario fuera de 3–30 caracteres | `{"status":"error","message":"El usuario debe tener entre 3 y 30 caracteres"}` |
| 400 | Contraseña de menos de 4 caracteres | `{"status":"error","message":"La contraseña debe tener al menos 4 caracteres"}` |
| 409 | Usuario ya existente | `{"status":"error","message":"Ese usuario ya existe"}` |
| 500 | Falta el grupo `profesor` | `{"status":"error","message":"No existe el grupo profesor (ejecutá init-db.mjs)"}` |

### Ejemplo con curl

```bash
curl -X POST http://127.0.0.1:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"profesor1","password":"clave123"}'
```

## Uso de la sesión

Con los datos de `/login`, enviar en cada ruta privada:

```http
x-user-id: 1
x-api-key: 3f2a9c1e-...
```

No se usa `Authorization: Bearer`; el backend lee exclusivamente esas dos cabeceras.
