import db from "../server/database.js";

export function getEndpointIdByPath(path) {
    const sql = `SELECT id FROM endpoint WHERE path = ?`;
    const stmt = db.prepare(sql);
    const row = stmt.get(path);

    return row || null;
}


export function createEndpoint(path) {
    const sql = `INSERT OR IGNORE INTO endpoint (path) VALUES (?)`;
    const stmt = db.prepare(sql);

    const result = stmt.run(path);
    if (result.changes === 0) {
    return {
        message: 'El endpoint ya existe'
        };
    }
    return {
        id: result.lastInsertRowid,
        path
    };
}


export function deleteEndpoint(endpointId) {
    const sql = `DELETE FROM access WHERE id_endpoint = ?`;
    const stmt = db.prepare(sql);

    stmt.run(endpointId);

    const sql2 = `DELETE FROM endpoint WHERE id = ?`;
    const stmt2 = db.prepare(sql2);

    const result = stmt2.run(endpointId);
    return{
      message: 'Endpoint eliminado',
      changes: result.changes
    };
}


export function getAllEndpoints() {
    const sql = `SELECT * FROM endpoint`;
    const stmt = db.prepare(sql);

    const rows = stmt.all();

    return rows;
}