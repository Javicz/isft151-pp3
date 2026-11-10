import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';


const db = new DatabaseSync('./db.sqlite3');

export default db;

