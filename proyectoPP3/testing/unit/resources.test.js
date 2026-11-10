import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDatabase } from '../setup.js';

describe('Resources Repository Unit Tests', () => {
    let db;

    beforeEach(() => {
        db = createTestDatabase();
    });

    it('should insert a resource successfully', () => {
        const stmt = db.prepare('INSERT INTO resources (name, category) VALUES (?, ?)');
        const result = stmt.run('Epson Projector', 'audiovisual');

        assert.equal(result.changes, 1);
        assert.ok(result.lastInsertRowid > 0);
    });

    it('should query and fetch available resources', () => {
        db.prepare('INSERT INTO resources (name, category, status) VALUES (?, ?, ?)').run('HP Laptop', 'computing', 'available');
        db.prepare('INSERT INTO resources (name, category, status) VALUES (?, ?, ?)').run('3D Printer', 'workshop', 'borrowed');

        const stmt = db.prepare('SELECT * FROM resources WHERE status = ?');
        const availableResources = stmt.all('available');

        assert.equal(availableResources.length, 1);
        assert.equal(availableResources[0].name, 'HP Laptop');
    });
});