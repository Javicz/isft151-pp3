import { createServer } from 'node:http';
import { setupRoutes } from './routes.js';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { authorize, isPublicRoute, getSessionFromRequest } from '../usescause/authorize.js'

function defaultConfig()
{
    const config =
    {
        server:
        {
            ip: '127.0.0.1',
            port: 3000,
            defaultPath: '../frontend/default.html'
        },
        database:
        {
            path: './db.sqlite3'
        }
    };

    return config;
}

function loadConfig()
{
    let config = null;
    try
    {
        const data = readFileSync(new URL('../configure/config.json', import.meta.url), 'utf-8');
        config = JSON.parse(data);
        console.log("Configuration loaded successfully.");
    }
    catch (error)
    {
        console.error("Error loading config.json. Using default values.");
        config = defaultConfig();
    }
    return config;
}

let config = loadConfig();

function connectDb(path)
{
  const dbPath = resolve(path);

  const db = new DatabaseSync(dbPath);

  return db;
}

const db = connectDb( config.database.path );

let router = new Map();
setupRoutes(router, config, db);


async function requestDispatcher(req, res)
{
    const url = new URL(req.url, 'http://' + config.server.ip);

    const path = url.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type, x-user-id, x-api-key');

    if (req.method === 'OPTIONS'){
        res.writeHead(204);
        res.end();
        return;
    }


    const handler = router.get(path);

    if (!handler){
        res.writeHead(404);
        res.end('Método no encontrado');
        return;
    }

    if (isPublicRoute(path)){
        return await handler(
            req,
            res
        );
    }

    const session = getSessionFromRequest(req);

    if (!session){
        res.writeHead(401);
        res.end('Sesión inválida');
        return;
    }

    const authorized = authorize(session.userId, path);

    if (!authorized)
    {
        res.writeHead(403);
        res.end('Acceso denegado');
        return;
    }

    return await handler(req, res);
}


function start()
{
    console.log('Server running...');
    console.log(`API: http://${config.server.ip}:${config.server.port}`);

    console.log('Frontend (Apache): http://localhost');
}

let server = createServer(requestDispatcher);

server.listen(config.server.port, config.server.ip, start);
