import db from "../server/database.js";

export function addAccess(groupId, endpointId) {
    const sql = `
      INSERT OR IGNORE INTO access (id_group, id_endpoint)
      VALUES (?, ?)
    `;
    const stmt = db.prepare(sql);
    const result = stmt.run(groupId, endpointId);

    return result;
    
}