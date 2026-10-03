import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';

const db = new DatabaseSync('./db.sqlite3');

// ============================================
// BORRAR TABLAS EXISTENTES
// ============================================
console.log('🗑️  Borrando tablas existentes...');

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

console.log('  ✅ Tablas borradas');

// ============================================
// CREAR TABLAS
// ============================================
console.log('\n🔧 Creando tablas...');

// TABLA: user
db.exec(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`);
console.log('  ✅ Tabla user creada');

// TABLA: group
db.exec(`
    CREATE TABLE IF NOT EXISTS \`group\` (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    );
`);
console.log('  ✅ Tabla group creada');

// TABLA: members
db.exec(`
    CREATE TABLE IF NOT EXISTS members (
        id_user INTEGER NOT NULL,
        id_group INTEGER NOT NULL,
        PRIMARY KEY (id_user, id_group),
        FOREIGN KEY (id_user) REFERENCES user(id),
        FOREIGN KEY (id_group) REFERENCES \`group\`(id)
    );
`);
console.log('  ✅ Tabla members creada');

// TABLA: endpoint
db.exec(`
    CREATE TABLE IF NOT EXISTS endpoint (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL
    );
`);
console.log('  ✅ Tabla endpoint creada');

// TABLA: access
db.exec(`
    CREATE TABLE IF NOT EXISTS access (
        id_group INTEGER NOT NULL,
        id_endpoint INTEGER NOT NULL,
        PRIMARY KEY (id_group, id_endpoint),
        FOREIGN KEY (id_group) REFERENCES \`group\`(id),
        FOREIGN KEY (id_endpoint) REFERENCES endpoint(id)
    );
`);
console.log('  ✅ Tabla access creada');

// TABLA: status
db.exec(`
    CREATE TABLE IF NOT EXISTS status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('gestion', 'conservacion')),
        color TEXT,
        description TEXT
    );
`);
console.log('  ✅ Tabla status creada');

// TABLA: resource
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
console.log('  ✅ Tabla resource creada');

// TABLA: loan
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
console.log('  ✅ Tabla loan creada');

// TABLA: reservation
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
console.log('  ✅ Tabla reservation creada');

// ============================================
// INSERTAR DATOS INICIALES
// ============================================
console.log('\n📝 Insertando datos iniciales...');

// Estados
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
console.log('  ✅ Estados insertados (11)');

// Grupos
db.exec(`
    INSERT INTO \`group\` (name) VALUES
    ('admin'), ('profesor'), ('tecnico'), ('preceptor');
`);
console.log('  ✅ Grupos insertados (4)');

// ============================================
// CREAR USUARIO ADMIN
// ============================================
console.log('\n👤 Creando usuario admin...');

const adminPassword = bcrypt.hashSync('admin', 10);

const result = db.prepare(
    'INSERT INTO user (username, password) VALUES (?, ?)'
).run('admin', adminPassword);

console.log('  ✅ Usuario admin creado (id: ' + result.lastInsertRowid + ')');

// Asignar admin al grupo admin
const adminUser = db.prepare('SELECT id FROM user WHERE username = ?').get('admin');
const adminGroup = db.prepare("SELECT id FROM `group` WHERE name = 'admin'").get();

db.prepare(
    'INSERT INTO members (id_user, id_group) VALUES (?, ?)'
).run(adminUser.id, adminGroup.id);

console.log('  ✅ Admin asignado al grupo admin');

// ============================================
// REGISTRAR ENDPOINTS
// ============================================
console.log('\n🔗 Registrando endpoints...');

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
    '/api/calendar/validate-schedule'
];

const insertEndpoint = db.prepare('INSERT OR IGNORE INTO endpoint (path) VALUES (?)');

endpoints.forEach(path => {
    insertEndpoint.run(path);
});

console.log(`  ✅ ${endpoints.length} endpoints registrados`);

// ============================================
// ASIGNAR PERMISOS AL GRUPO ADMIN
// ============================================
console.log('\n🔑 Asignando permisos al grupo admin...');

const insertAccess = db.prepare('INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES (?, ?)');
const getEndpoint = db.prepare('SELECT id FROM endpoint WHERE path = ?');

endpoints.forEach(path => {
    const endpoint = getEndpoint.get(path);
    if (endpoint) {
        insertAccess.run(adminGroup.id, endpoint.id);
    }
});

console.log(`  ✅ ${endpoints.length} permisos asignados al grupo admin`);

// ============================================
// RESUMEN FINAL
// ============================================
console.log('\n' + '='.repeat(50));
console.log('✅ BASE DE DATOS INICIALIZADA CORRECTAMENTE');
console.log('='.repeat(50));
console.log('');
console.log('📌 Usuario admin:');
console.log('   Usuario: admin');
console.log('   Contraseña: admin');
console.log('');
console.log('📌 Datos creados:');
console.log(`   - 1 usuario (admin)`);
console.log(`   - 4 grupos (admin, profesor, tecnico, preceptor)`);
console.log(`   - 11 estados (6 gestion + 5 conservacion)`);
console.log(`   - ${endpoints.length} endpoints`);
console.log(`   - ${endpoints.length} permisos`);
console.log('');
console.log('🚀 Podés iniciar el backend con:');
console.log('   node backend/server/main.mjs');
console.log('');