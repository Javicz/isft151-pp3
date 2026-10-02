import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./db.sqlite3');

console.log('🔧 Creando tablas...');

// ============================================
// TABLA: user
// ============================================
db.exec(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`);
console.log('  ✅ Tabla user creada');

// ============================================
// TABLA: group
// ============================================
db.exec(`
    CREATE TABLE IF NOT EXISTS \`group\` (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    );
`);
console.log('  ✅ Tabla group creada');

// ============================================
// TABLA: members
// ============================================
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

// ============================================
// TABLA: endpoint
// ============================================
db.exec(`
    CREATE TABLE IF NOT EXISTS endpoint (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL
    );
`);
console.log('  ✅ Tabla endpoint creada');

// ============================================
// TABLA: access
// ============================================
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

// ============================================
// TABLA: status
// ============================================
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

// ============================================
// TABLA: resource
// ============================================
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

// ============================================
// TABLA: loan
// ============================================
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

// ============================================
// TABLA: reservation
// ============================================
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
// DATOS INICIALES
// ============================================
console.log('\n📝 Insertando datos iniciales...');

db.exec(`
    INSERT OR IGNORE INTO status (name, type, color, description) VALUES
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
console.log('  ✅ Estados insertados');

db.exec(`
    INSERT OR IGNORE INTO \`group\` (name) VALUES
    ('admin'), ('profesor'), ('tecnico'), ('preceptor');
`);
console.log('  ✅ Grupos insertados');

console.log('\n✅ Base de datos configurada correctamente.');