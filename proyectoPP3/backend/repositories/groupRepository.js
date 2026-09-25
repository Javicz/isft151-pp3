import db from "../server/database.js";

export function createGroup(groupName) {
  const sql = `INSERT INTO \`group\` (name) VALUES (?)`;
  const stmt = db.prepare(sql);

  const result = stmt.run(groupName);

  return {
    id: result.lastInsertRowid,
    name: groupName
  };
}

export function deleteGroup(groupId) {
  const sql = `DELETE FROM members WHERE id_group = ?`;
  const stmt = db.prepare(sql);
  stmt.run(groupId);

  const sql1 = `DELETE FROM access WHERE id_group = ?`;
  const stmt1 = db.prepare(sql1);
  stmt1.run(groupId);

  const sql2 = `DELETE FROM \`group\` WHERE id = ?`;
  const stmt2 = db.prepare(sql2);
  
  const result = stmt2.run(groupId);
  return{
    message: 'grupo eliminado',
    changes: result.changes
  };
}

export function updateGroup(groupId, newName) {
  const sql = `UPDATE \`group\` SET name = ? WHERE id = ?`;
  const stmt = db.prepare(sql);

  stmt.run(newName, groupId);

  return{
    message: 'grupo actualizado'
  };
}

export function getAllGroups() {
  const sql = `SELECT id, name FROM \`group\``;
  const stmt = db.prepare(sql);

  return stmt.all();
}

// repositories/groupRepository.js
export function getGroupIdByName(name) {
    const sql = `SELECT id FROM \`group\` WHERE name = ?`;
    const stmt = db.prepare(sql);

    const row = stmt.get(name);

    return row ? {id: row.id} : null;
}