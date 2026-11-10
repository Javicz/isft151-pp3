import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(process.argv[2] || resolve(__dirname, '..', 'frontend'));
const port = parseInt(process.env.PORT || '8080', 10);
const host = process.env.HOST || '127.0.0.1';

const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function resolveRequestPath(urlPath) {
    const decoded = decodeURIComponent(urlPath.split('?')[0]);
    const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
    const target = resolve(join(publicDir, normalize(relative)));

    if (!target.startsWith(publicDir)) return null;
    if (!existsSync(target) || !statSync(target).isFile()) return null;

    return target;
}

const server = createServer(async (req, res) => {
    const target = resolveRequestPath(req.url || '/');

    if (!target) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
    }

    try {
        const content = await readFile(target);
        res.writeHead(200, {
            'Content-Type': contentTypes[extname(target).toLowerCase()] || 'application/octet-stream'
        });
        res.end(content);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal server error');
    }
});

server.listen(port, host, function () {
    console.log('Frontend available at http://' + host + ':' + port);
    console.log('Serving directory: ' + publicDir);
});
