# Carpeta `release`

Esta carpeta reúne las tareas de **preparación del entorno** y **despliegue** del proyecto. No contiene la lógica de la aplicación: backend y frontend siguen viviendo en `backend/` y `frontend/`. Acá solo hay scripts que automatizan instalación, base de datos, pruebas y armado de una copia de producción.

## Archivos

| Archivo | Qué hace |
|---|---|
| `init-db.mjs` | Elimina las tablas de `db.sqlite3` y las vuelve a crear. Carga estados, recursos iniciales, grupos, endpoints, permisos y el usuario `admin` / `admin`. |
| `setup.ps1` | Versión Windows. Verifica Node, ejecuta `npm install` y luego `init-db.mjs`. |
| `setup.sh` | Versión Linux/macOS. Hace lo mismo que `setup.ps1`. |
| `deploy.ps1` | Versión Windows. Ejecuta `setup.ps1`, corre los tests, arma `dist/` y prepara la base de producción. No arranca el servidor salvo que se lo pidas con `-Start`. |
| `deploy.sh` | Versión Linux/macOS. Equivalente a `deploy.ps1`. No arranca el servidor salvo `START=1`. |
| `serve-frontend.mjs` | Servidor estático opcional para abrir el frontend sin Apache/Nginx. |
| `README.md` | Este documento. |

## Importante: la base de datos se reinicia

`init-db.mjs`, `setup` y `deploy` **borran y recrean la base de datos**. Si ya cargaste usuarios, recursos o reservas, al ejecutarlos se pierde todo.

- Usalos solo en la primera instalación o cuando quieras dejar la base limpia.
- Para el uso diario **no** hay que ejecutarlos.
- `deploy` además reinicia la base de la copia desplegada (`dist/db.sqlite3`), no la de desarrollo, aunque antes pasa por `setup`, que sí reinicia la raíz.

## Uso habitual

### Primera vez en una máquina (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File release/setup.ps1
```

### Primera vez en una máquina (Linux/macOS)

```bash
bash release/setup.sh
```

### Uso diario, sin tocar la base

```powershell
node backend/server/main.mjs
```

Backend en `http://127.0.0.1:3000`. El frontend se abre sirviendo `frontend/` con Apache o con:

```powershell
node release/serve-frontend.mjs frontend
```

### Armar una copia de producción

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File release/deploy.ps1
```

Linux/macOS:

```bash
bash release/deploy.sh
```

El resultado queda en `dist/`, con esta forma:

```
dist/
  backend/
  frontend/
  release/
  node_modules/
  db.sqlite3
  package.json
```

`dist/` es una **copia generada**, no código fuente. Se puede borrar sin problema y se vuelve a crear la próxima vez que ejecutes `deploy`. No la edites a mano: los cambios se pierden en el siguiente despliegue.

Para arrancar esa copia:

```powershell
cd dist
node backend/server/main.mjs
```

### Arrancar el servidor automáticamente al desplegar (opcional)

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File release/deploy.ps1 -Start
```

Linux/macOS:

```bash
START=1 bash release/deploy.sh
```

Sin ese parámetro, `deploy` solo construye y no inicia ningún proceso.

## Opciones útiles

`deploy.ps1`:

- `-Start`: arranca el backend de `dist/` al terminar.
- `-NoStart`: fuerza no arrancar (compatibilidad).
- `-SkipTests`: omite los tests.
- `-DeployDir "ruta"`: cambia la carpeta de salida (por defecto `dist`).

`deploy.sh` usa variables de entorno equivalentes: `START=1`, `NO_START=1`, `SKIP_TESTS=1`, `DEPLOY_DIR="ruta"`.

`setup.ps1` / `setup.sh`:

- `-SkipInstall` / `SKIP_INSTALL=1`: no ejecuta `npm install`, solo inicializa la base.

## Tests

`deploy` ejecuta:

```powershell
node --test testing/unit/*.test.js testing/integration/*.test.js
```

Si algún test falla, el despliegue se aborta y no se arma `dist/`. Se pueden correr manualmente en cualquier momento con ese mismo comando; no modifican la base de desarrollo.
