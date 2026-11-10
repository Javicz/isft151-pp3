import crypto from 'node:crypto';
import db from '../server/database.js';

function addMinutes(dateTime, minutes) {
    const parts = dateTime.split(' ');
    const dateParts = parts[0].split('-');
    const timeParts = parts[1].split(':');

    const date = new Date(
        parseInt(dateParts[0], 10),
        parseInt(dateParts[1], 10) - 1,
        parseInt(dateParts[2], 10),
        parseInt(timeParts[0], 10),
        parseInt(timeParts[1], 10)
    );

    date.setMinutes(date.getMinutes() + minutes);

    const pad = function (number) {
        return String(number).padStart(2, '0');
    };

    return date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + ' ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes());
}

export function createReservations(resourceId, userId, blocks, teacher) {
    const sql = `
        INSERT INTO reservation
            (id, resourceId, userId, startDate, endDate, title, description, state)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    const stmt = db.prepare(sql);

    for (let i = 0; i < blocks.length; i++) {
        stmt.run(
            crypto.randomUUID(),
            resourceId,
            userId,
            blocks[i],
            addMinutes(blocks[i], 30),
            teacher || 'Reserva',
            resourceId
        );
    }
}

export function insertReservations(resourceId, userId, blocks) {
    const sql = `
        INSERT INTO reservation
            (id, resourceId, userId, startDate, endDate, title, description, state)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    const stmt = db.prepare(sql);

    for (let i = 0; i < blocks.length; i++) {
        stmt.run(
            crypto.randomUUID(),
            resourceId,
            userId,
            blocks[i].dateTime,
            addMinutes(blocks[i].dateTime, 30),
            blocks[i].teacher || 'Reserva',
            resourceId
        );
    }
}

export function replaceReservations(resourceId, userId, blocks) {
    const deleteStmt = db.prepare('DELETE FROM reservation WHERE resourceId = ?');
    deleteStmt.run(resourceId);

    const sql = `
        INSERT INTO reservation
            (id, resourceId, userId, startDate, endDate, title, description, state)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    const stmt = db.prepare(sql);

    for (let i = 0; i < blocks.length; i++) {
        stmt.run(
            crypto.randomUUID(),
            resourceId,
            userId,
            blocks[i].dateTime,
            addMinutes(blocks[i].dateTime, 30),
            blocks[i].teacher || 'Reserva',
            resourceId
        );
    }
}

export function deleteReservations(resourceId, blocks) {
    const sql = 'DELETE FROM reservation WHERE resourceId = ? AND startDate = ?';
    const stmt = db.prepare(sql);
    let deleted = 0;

    for (let i = 0; i < blocks.length; i++) {
        const result = stmt.run(resourceId, blocks[i]);
        deleted = deleted + result.changes;
    }

    return deleted;
}

export function listReservations(resourceId) {
    if (resourceId) {
        return db.prepare(
            'SELECT * FROM reservation WHERE resourceId = ? ORDER BY startDate'
        ).all(resourceId);
    }

    return db.prepare(
        'SELECT * FROM reservation ORDER BY startDate'
    ).all();
}
