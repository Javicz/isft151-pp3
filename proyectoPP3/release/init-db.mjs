import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const databasePath = resolve(projectRoot, 'db.sqlite3');

const db = new DatabaseSync(databasePath);

console.log('Database: ' + databasePath);
console.log('Dropping existing tables...');

db.exec(`
    DROP TABLE IF EXISTS reservation;
    DROP TABLE IF EXISTS loan;
    DROP TABLE IF EXISTS resource;
    DROP TABLE IF EXISTS access;
    DROP TABLE IF EXISTS endpoint;
    DROP TABLE IF EXISTS members;
    DROP TABLE IF EXISTS \`group\`;
    DROP TABLE IF EXISTS user;
    DROP TABLE IF EXISTS status;
`);

console.log('Tables dropped');
console.log('\nCreating tables...');

db.exec(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`);
console.log('Table user created');

db.exec(`
    CREATE TABLE IF NOT EXISTS \`group\` (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    );
`);
console.log('Table group created');

db.exec(`
    CREATE TABLE IF NOT EXISTS members (
        id_user INTEGER NOT NULL,
        id_group INTEGER NOT NULL,
        PRIMARY KEY (id_user, id_group),
        FOREIGN KEY (id_user) REFERENCES user(id),
        FOREIGN KEY (id_group) REFERENCES \`group\`(id)
    );
`);
console.log('Table members created');

db.exec(`
    CREATE TABLE IF NOT EXISTS endpoint (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL
    );
`);
console.log('Table endpoint created');

db.exec(`
    CREATE TABLE IF NOT EXISTS access (
        id_group INTEGER NOT NULL,
        id_endpoint INTEGER NOT NULL,
        PRIMARY KEY (id_group, id_endpoint),
        FOREIGN KEY (id_group) REFERENCES \`group\`(id),
        FOREIGN KEY (id_endpoint) REFERENCES endpoint(id)
    );
`);
console.log('Table access created');

db.exec(`
    CREATE TABLE IF NOT EXISTS status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('gestion', 'conservacion')),
        color TEXT,
        description TEXT
    );
`);
console.log('Table status created');

db.exec(`
    CREATE TABLE IF NOT EXISTS resource (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        serialNumber TEXT UNIQUE,
        location TEXT NOT NULL,
        statusId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (statusId) REFERENCES status(id)
    );
`);
console.log('Table resource created');

db.exec(`
    CREATE TABLE IF NOT EXISTS loan (
        id TEXT PRIMARY KEY,
        resourceId TEXT NOT NULL,
        userId INTEGER NOT NULL,
        loanDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        estimatedReturnDate DATETIME NOT NULL,
        returnDate DATETIME,
        pickupState TEXT,
        pickupObservations TEXT,
        returnState TEXT,
        returnObservations TEXT,
        returnerId INTEGER,
        state TEXT DEFAULT 'active' CHECK(state IN ('active', 'finished', 'overdue')),
        FOREIGN KEY (resourceId) REFERENCES resource(id),
        FOREIGN KEY (userId) REFERENCES user(id),
        FOREIGN KEY (returnerId) REFERENCES user(id)
    );
`);
console.log('Table loan created');

db.exec(`
    CREATE TABLE IF NOT EXISTS reservation (
        id TEXT PRIMARY KEY,
        resourceId TEXT NOT NULL,
        userId INTEGER NOT NULL,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        state TEXT DEFAULT 'active' CHECK(state IN ('active', 'cancelled', 'finished')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resourceId) REFERENCES resource(id),
        FOREIGN KEY (userId) REFERENCES user(id)
    );
`);
console.log('Table reservation created');

console.log('\nInserting initial data...');

db.exec(`
    INSERT INTO status (name, type, color, description) VALUES
    ('Disponible', 'gestion', '#28a745', 'Recurso disponible'),
    ('Prestado', 'gestion', '#ffc107', 'Recurso prestado'),
    ('Mantenimiento', 'gestion', '#fd7e14', 'Recurso en reparación'),
    ('Reservado', 'gestion', '#17a2b8', 'Recurso reservado'),
    ('Extraviado', 'gestion', '#dc3545', 'Recurso no localizado'),
    ('Baja', 'gestion', '#6c757d', 'Recurso dado de baja'),
    ('Excelente', 'conservacion', '#28a745', 'Perfectas condiciones'),
    ('Buen estado', 'conservacion', '#17a2b8', 'Funciona correctamente'),
    ('Con detalles', 'conservacion', '#ffc107', 'Pequeños problemas'),
    ('Dañado', 'conservacion', '#fd7e14', 'Daños significativos'),
    ('Fuera de servicio', 'conservacion', '#dc3545', 'No operable');
`);
console.log('Statuses inserted (11)');

const initialResources = [
    ['computadora', 'Computadora', 'Dell', 'OptiPlex 3080', 'COMP-001', 'Aula de Informática', 1],
    ['teclado', 'Teclado', 'Logitech', 'K120', 'TEC-001', 'Aula de Informática', 1],
    ['impresora', 'Impresora', 'HP', 'LaserJet Pro', 'IMP-001', 'Dirección', 1],
    ['proyector', 'Proyector', 'Epson', 'PowerLite', 'PRO-001', 'Aula Magna', 1]
];

const insertResource = db.prepare(`
    INSERT OR IGNORE INTO resource
        (id, type, brand, model, serialNumber, location, statusId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

initialResources.forEach(function (resource) {
    insertResource.run(
        resource[0], resource[1], resource[2], resource[3],
        resource[4], resource[5], resource[6]
    );
});

console.log('Initial resources inserted (4)');

db.exec(`
    INSERT INTO \`group\` (name) VALUES
    ('admin'), ('profesor'), ('tecnico'), ('preceptor');
`);
console.log('Groups inserted (4)');

console.log('\nCreating admin user...');

const adminPassword = bcrypt.hashSync('admin', 10);

const result = db.prepare(
    'INSERT INTO user (username, password) VALUES (?, ?)'
).run('admin', adminPassword);

console.log('Admin user created (id: ' + result.lastInsertRowid + ')');

const adminUser = db.prepare('SELECT id FROM user WHERE username = ?').get('admin');
const adminGroup = db.prepare("SELECT id FROM `group` WHERE name = 'admin'").get();

db.prepare(
    'INSERT INTO members (id_user, id_group) VALUES (?, ?)'
).run(adminUser.id, adminGroup.id);

console.log('Admin assigned to admin group');

console.log('\nRegistering endpoints...');

const endpoints = [
    '/login',
    '/register',
    '/api/resources/list',
    '/api/resources/get',
    '/api/resources/create',
    '/api/resources/update',
    '/api/resources/remove',
    '/api/resources/search',
    '/api/resources/qr',
    '/api/status/list',
    '/api/status/get',
    '/api/status/create',
    '/api/status/remove',
    '/api/status/change',
    '/api/loans/list',
    '/api/loans/get',
    '/api/loans/create',
    '/api/loans/remove',
    '/api/loans/return',
    '/api/loans/overdue',
    '/api/reservations/list',
    '/api/reservations/get',
    '/api/reservations/create',
    '/api/reservations/cancel',
    '/api/availability/current',
    '/api/availability/count',
    '/api/availability/summary',
    '/api/calendar/reservations',
    '/api/calendar/business-days',
    '/api/calendar/validate-date',
    '/api/calendar/validate-schedule',
    '/api/inventory/list',
    '/api/getAvailability',
    '/api/applyReservation'
];

const insertEndpoint = db.prepare('INSERT OR IGNORE INTO endpoint (path) VALUES (?)');

endpoints.forEach(path => {
    insertEndpoint.run(path);
});

console.log(`${endpoints.length} endpoints registered`);

console.log('\nAssigning permissions to admin group...');

const insertAccess = db.prepare('INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES (?, ?)');
const getEndpoint = db.prepare('SELECT id FROM endpoint WHERE path = ?');

endpoints.forEach(path => {
    const endpoint = getEndpoint.get(path);
    if (endpoint) {
        insertAccess.run(adminGroup.id, endpoint.id);
    }
});

console.log(`${endpoints.length} permissions assigned to admin group`);

console.log('\n' + '='.repeat(50));
console.log('DATABASE INITIALIZED SUCCESSFULLY');
console.log('='.repeat(50));
console.log('');
console.log('Admin user:');
console.log('   Username: admin');
console.log('   Password: admin');
console.log('');
console.log('Created data:');
console.log(`   - 1 user (admin)`);
console.log(`   - 4 groups (admin, profesor, tecnico, preceptor)`);
console.log(`   - 11 statuses (6 gestion + 5 conservacion)`);
console.log(`   - ${endpoints.length} endpoints`);
console.log(`   - ${endpoints.length} permissions`);
console.log('');
console.log('Start the backend with:');
console.log('   node backend/server/main.mjs');
console.log('');
