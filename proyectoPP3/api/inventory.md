# Inventario y recursos

## POST /api/inventory/list

Lista todos los recursos con su estado.

- Autenticación: pública.
- Alias: `POST /api/resources/list` (misma respuesta, pero la ruta del alias es privada y requiere permiso).

### Cuerpo

No requiere datos. Se puede enviar `{}`.

### Respuesta 200

```json
{
  "status": "success",
  "data": [
    {
      "id": "computadora",
      "type": "Computadora",
      "brand": "Dell",
      "model": "OptiPlex 3080",
      "serialNumber": "COMP-001",
      "location": "Aula de Informática",
      "statusId": 1,
      "status": "Disponible"
    }
  ]
}
```

### Campos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador del recurso. Se usa en reservas. |
| `type` | string | Tipo de recurso. |
| `brand` | string \| null | Marca. |
| `model` | string \| null | Modelo. |
| `serialNumber` | string \| null | Número de serie único. |
| `location` | string | Ubicación física. |
| `statusId` | number \| null | ID del estado. |
| `status` | string \| null | Nombre del estado (`Disponible`, `Reservado`, etc.). |

### Error

| Código | Respuesta |
|---|---|
| 500 | `{"status":"error","message":"..."}` |

## POST /api/resources/create

Agrega un recurso al inventario.

- Autenticación: sesión válida **y** permiso de administrador.
- El handler comprueba el permiso contra `/api/reservations/cancel`, no contra esta ruta.

### Cuerpo

```json
{
  "type": "Notebook",
  "brand": "Lenovo",
  "model": "ThinkPad E14",
  "serialNumber": "NB-001",
  "location": "Dirección"
}
```

`type` y `location` son obligatorios. Los demás campos son opcionales.

### Límites

| Campo | Máximo |
|---|---|
| `type` | 40 caracteres |
| `brand` | 60 caracteres |
| `model` | 60 caracteres |
| `serialNumber` | 60 caracteres |
| `location` | 80 caracteres |

### Respuesta 200

```json
{
  "status": "success",
  "message": "Recurso agregado: notebook",
  "data": {
    "id": "notebook",
    "type": "Notebook",
    "brand": "Lenovo",
    "model": "ThinkPad E14",
    "serialNumber": "NB-001",
    "location": "Dirección",
    "statusId": 1,
    "status": "Disponible"
  }
}
```

El `id` se genera a partir de `type`, en minúsculas y con guiones. Si ya existe, se agrega un sufijo numérico (`notebook-2`).

### Errores

| Código | Caso |
|---|---|
| 400 | JSON inválido, falta `type` o falta `location` |
| 401 | Sin sesión |
| 403 | Sesión sin permiso de administrador |
| 409 | `serialNumber` duplicado |
| 500 | Error interno |

## POST /api/resources/delete

Elimina un recurso y sus reservas.

- Autenticación: sesión válida **y** permiso de administrador.
- El handler comprueba el permiso contra `/api/reservations/cancel`.

### Cuerpo

```json
{
  "id": "notebook"
}
```

`id` debe ser un string no vacío.

### Respuesta 200

```json
{
  "status": "success",
  "message": "Recurso eliminado: notebook (también se borraron 2 bloque/s reservado/s)"
}
```

Si no tenía reservas, el paréntesis no aparece.

### Errores

| Código | Caso |
|---|---|
| 400 | `id` ausente o inválido |
| 401 | Sin sesión |
| 403 | Sin permiso de administrador |
| 404 | El recurso no existe |
| 409 | Tiene préstamos registrados y no se puede borrar |
| 500 | Error interno |

### Ejemplo

```bash
curl -X POST http://127.0.0.1:3000/api/resources/delete \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -H "x-api-key: <apiKey>" \
  -d '{"id":"notebook"}'
```
