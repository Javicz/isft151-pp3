# Disponibilidad y reservas

La disponibilidad se guarda por recurso en `backend/data/<id>.json`. La grilla va de **06:00 a 24:00** en bloques de **30 minutos**.

Formato de bloque: `"YYYY-MM-DD HH:MM"`, por ejemplo `"2026-11-06 08:30"`.

## POST /api/getAvailability

Devuelve los bloques ocupados de un recurso.

- Autenticación: pública.
- Alias: `POST /api/calendar/reservations`.

### Cuerpo

Todos los campos son opcionales:

```json
{
  "resource": "impresora",
  "startTime": "06:00",
  "endTime": "24:00"
}
```

| Campo | Por defecto |
|---|---|
| `resource` | `"impresora"` |
| `startTime` | `"06:00"` |
| `endTime` | `"24:00"` |

### Respuesta 200

```json
{
  "status": "success",
  "data": {
    "startTime": "06:00",
    "endTime": "24:00",
    "intervalDuration": 30,
    "occupiedZone": [
      {
        "dateTime": "2026-11-06 08:30",
        "occupied": true,
        "teacher": "Javier"
      }
    ]
  }
}
```

`occupiedZone` contiene solo bloques ocupados; los libres se deducen de la grilla.

### Errores

| Código | Caso |
|---|---|
| 400 | `resource` inexistente o formato de hora distinto de `HH:MM` |
| 400 | JSON inválido |

### Ejemplo

```bash
curl -X POST http://127.0.0.1:3000/api/getAvailability \
  -H "Content-Type: application/json" \
  -d '{"resource":"impresora"}'
```

## POST /api/applyReservation

Guarda el estado final de una selección de bloques. Puede agregar y/o liberar reservas según la diferencia con lo guardado.

- Autenticación: la ruta es pública, pero **agregar o quitar bloques exige sesión**.
- Alias: `POST /api/reservations/create`.

### Cuerpo

```json
{
  "resource": "impresora",
  "blocks": [
    { "dateTime": "2026-11-07 09:00", "occupied": true, "teacher": "Javier" },
    { "dateTime": "2026-11-07 09:30", "occupied": true, "teacher": "Javier" }
  ]
}
```

Solo se consideran los bloques con `occupied: true`. Un bloque ausente (o con `occupied: false`) se interpreta como liberado.

### Reglas

- Si hay bloques nuevos:
  - Requiere sesión.
  - No se permiten horarios ya pasados.
  - Un usuario común reserva siempre a su propio nombre; un administrador puede indicar `teacher`.
  - Si el bloque ya existe con otro docente, responde `409`.
- Si hay bloques quitados:
  - Requiere sesión.
  - No se permiten horarios pasados.
  - Un usuario común solo puede liberar reservas cuyo `teacher` sea su propio usuario.
  - Un administrador puede liberar cualquiera.
- Si el estado final agrega y quita bloques al mismo tiempo, **se procesan solo las altas**; las bajas de esa misma petición se ignoran.
- Si no hay diferencias: `200` con `"No había cambios para guardar"`.

### Respuesta 200

```json
{
  "status": "success",
  "message": "Reserva guardada a nombre de Javier (2 bloque/s)"
}
```

O:

```json
{
  "status": "success",
  "message": "Bloques liberados: 2"
}
```

### Errores

| Código | Caso |
|---|---|
| 400 | `blocks` no es array, `dateTime` inválido, recurso inexistente, bloque fuera de grilla u horario pasado |
| 401 | Se intenta agregar o liberar sin sesión |
| 403 | Se intenta liberar una reserva ajena sin ser administrador |
| 409 | El bloque ya está ocupado por otro docente |
| 500 | Error interno |

### Ejemplo

```bash
curl -X POST http://127.0.0.1:3000/api/applyReservation \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -H "x-api-key: <apiKey>" \
  -d '{"resource":"impresora","blocks":[{"dateTime":"2026-11-07 09:00","occupied":true,"teacher":"Javier"}]}'
```

## POST /api/reservations/cancel

Libera bloques indicando directamente sus fechas.

- Autenticación: sesión válida y permiso sobre `/api/reservations/cancel` (el grupo `admin` lo tiene por defecto).
- No comprueba que la reserva pertenezca al usuario; cualquier sesión autorizada puede liberar.

### Cuerpo

```json
{
  "resource": "impresora",
  "blocks": [
    "2026-11-07 09:00",
    "2026-11-07 09:30"
  ]
}
```

`blocks` es un array de strings, no de objetos.

### Respuesta 200

```json
{
  "status": "success",
  "message": "Bloques liberados: 2"
}
```

### Errores

| Código | Caso |
|---|---|
| 400 | Array vacío, fecha inválida, recurso inexistente u horario pasado |
| 401 | Sin sesión |
| 403 | Sin permiso sobre la ruta |
| 409 | Los bloques ya estaban libres |
| 500 | Error interno |

### Ejemplo

```bash
curl -X POST http://127.0.0.1:3000/api/reservations/cancel \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -H "x-api-key: <apiKey>" \
  -d '{"resource":"impresora","blocks":["2026-11-07 09:00"]}'
```
