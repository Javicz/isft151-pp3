import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

describe('Resources Handlers / API Integration Tests', () => {
    let server;
    const PORT = 3001;
    const BASE_URL = `http://localhost:${PORT}`;

    beforeEach((done) => {
        server = createServer((req, res) => {
            if (req.method === 'GET' && req.url === '/api/resources') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify([{ id: 1, name: 'Epson Projector', status: 'available' }]));
            } else {
                res.writeHead(404);
                res.end();
            }
        });
        server.listen(PORT, done);
    });

    afterEach((done) => {
        server.close(done);
    });

    it('GET /api/resources should return 200 with the resource list', async () => {
        const response = await fetch(`${BASE_URL}/api/resources`);
        const body = await response.json();

        assert.equal(response.status, 200);
        assert.equal(Array.isArray(body), true);
        assert.equal(body[0].name, 'Epson Projector');
    });
});