import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDatabase } from '../setup.js';

describe('Users Repository Unit Tests', () => {
    let db;

    beforeEach(() => {
        db = createTestDatabase();
    });

    it('should register a new user successfully', () => {
        const stmt = db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)');
        const result = stmt.run('Carlos Gómez', 'carlos@school.edu', 'admin');

        assert.equal(result.changes, 1);
        assert.ok(result.lastInsertRowid > 0);
    });

    it('should not allow duplicate email registrations', () => {
        const stmt = db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)');
        stmt.run('María Pérez', 'maria@school.edu', 'user');

        assert.throws(() => {
            stmt.run('María Otra vez', 'maria@school.edu', 'user');
        });
    });
});