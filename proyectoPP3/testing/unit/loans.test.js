import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDatabase } from '../setup.js';

describe('Loans Repository Unit Tests', () => {
    let db;

    beforeEach(() => {
        db = createTestDatabase();
        
        db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run('Ana López', 'ana@school.edu');
        db.prepare('INSERT INTO resources (name, category) VALUES (?, ?)').run('Notebook Lenovo', 'computing');
    });

    it('should register a loan correctly', () => {
        const loanStmt = db.prepare(`
            INSERT INTO loans (resource_id, user_id, start_date) 
            VALUES (?, ?, ?)
        `);
        
        const result = loanStmt.run(1, 1, '2026-11-06 10:00:00');

        assert.equal(result.changes, 1);
        assert.ok(result.lastInsertRowid > 0);
    });

    it('should query loan details with joined tables', () => {
        db.prepare('INSERT INTO loans (resource_id, user_id, start_date) VALUES (?, ?, ?)').run(1, 1, '2026-11-06 10:00:00');

        const query = db.prepare(`
            SELECT loans.id, users.name as user_name, resources.name as resource_name 
            FROM loans
            JOIN users ON loans.user_id = users.id
            JOIN resources ON loans.resource_id = resources.id
        `);

        const loanDetail = query.get();

        assert.equal(loanDetail.user_name, 'Ana López');
        assert.equal(loanDetail.resource_name, 'Notebook Lenovo');
    });
});