import db from '../server/database.js';

export function getUserByUsername(username) {
    const sql = `SELECT id, username, password FROM user WHERE username = ?`;
    const stmt = db.prepare(sql);
    
    return stmt.get(username);
}

export function getGroupsByUserId(userId) {

    const sql = `
      SELECT g.id, g.name
      FROM \`group\` AS g
      JOIN members AS m ON g.id = m.id_group
      WHERE m.id_user = ?
    `;
    const stmt = db.prepare(sql);

    return stmt.all(userId);
}

export function getEndpointsByGroupId(groupId) {
    const sql = `
      SELECT e.path
      FROM endpoint AS e
      JOIN access AS a ON e.id = a.id_endpoint
      WHERE a.id_group = ?
    `;
    const stmt = db.prepare(sql);
    return stmt.get(groupId);
}