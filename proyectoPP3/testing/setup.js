import { DatabaseSync } from 'node:sqlite';

/**
 * Crea y retorna una instancia de base de datos SQLite en memoria
 * con el esquema básico necesario para ejecutar las pruebas.
 */
export function createTestDatabase() {
    const db = new DatabaseSync(':memory:');

    // Creación de las tablas principales de prueba
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'user'
        );

        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            status TEXT DEFAULT 'available'
        );

        CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resource_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            return_date TEXT,
            FOREIGN KEY (resource_id) REFERENCES resources (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
    `);

    return db;
}