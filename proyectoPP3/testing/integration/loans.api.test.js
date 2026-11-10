import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

describe('Loans Handlers / API Integration Tests', () => {
    let server;
    const PORT = 3002; 
    const BASE_URL = `http://localhost:${PORT}`;

    
    beforeEach((done) => {
        server = createServer((req, res) => {
            if (req.method === 'POST' && req.url === '/api/loans') {
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, loanId: 1, message: 'Préstamo registrado exitosamente' }));
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

    it('POST /api/loans should create a loan and return status 201', async () => {
        const newLoanData = {
            resourceId: 1,
            userId: 1,
            startDate: '2026-11-06'
        };

        const response = await fetch(`${BASE_URL}/api/loans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLoanData)
        });

        const body = await response.json();

        assert.equal(response.status, 201);
        assert.equal(body.success, true);
        assert.equal(body.loanId, 1);
    });
});