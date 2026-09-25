import bcrypt from 'bcryptjs';
import db from '../server/database.js';

export function insertarUsuario(username, password)
{
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = `
        INSERT INTO user (username, password)
        VALUES (?, ?)
    `;

    const stmt = db.prepare(sql);

    const result = stmt.run(username, hashedPassword);
    
    return {
        id: result.lastInsertRowid,
        username
    };
    
}

export function deleteUser(userId) {
  const sql = `DELETE FROM members WHERE id_user = ?`;
  const stmt = db.prepare(sql);

  stmt.run(userId);

  const sql2 = `DELETE FROM user WHERE id = ?`;
  const stmt2 = db.prepare(sql2);

  const result = stmt2.run(userId);
  return{
    message: 'usuario eliminado',
    changes: result.changes
  };
}

export function getAllUsers() {
    const sql = `SELECT id, username FROM user`;
    const stmt = db.prepare(sql);

    const rows = stmt.all();

    return rows;
}

export function assignUsertoGroup(userId, groupId){
    const sql = `
        INSERT OR REPLACE INTO members (id_user, id_group)
        VALUES (?, ?)
        `;
    const stmt = db.prepare(sql);
    const result = stmt.run(userId, groupId);

    if (result.changes === 0) {
    return {
        message: 'No se realizó ningún cambio'
      };
    }

    return {
        message: 'Usuario agregado al grupo con éxito',
        changes: result.changes
    };
}
