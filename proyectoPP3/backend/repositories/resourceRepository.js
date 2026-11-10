import db from '../server/database.js';

export function getAllResources() {
    const sql = `
        SELECT r.id,
               r.type,
               r.brand,
               r.model,
               r.serialNumber,
               r.location,
               r.statusId,
               s.name AS status
        FROM resource AS r
        LEFT JOIN status AS s ON s.id = r.statusId
        ORDER BY r.type
    `;

    return db.prepare(sql).all();
}

export function getResourceById(resourceId) {
    const sql = `
        SELECT r.id,
               r.type,
               r.brand,
               r.model,
               r.serialNumber,
               r.location,
               r.statusId,
               s.name AS status
        FROM resource AS r
        LEFT JOIN status AS s ON s.id = r.statusId
        WHERE r.id = ?
    `;

    return db.prepare(sql).get(resourceId);
}

export function insertResource(resource) {
    const sql = `
        INSERT OR IGNORE INTO resource
            (id, type, brand, model, serialNumber, location, statusId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    return db.prepare(sql).run(
        resource.id,
        resource.type,
        resource.brand,
        resource.model,
        resource.serialNumber,
        resource.location,
        resource.statusId
    );
}


function toSlug(text) {
    let slug = String(text);

    slug = slug.normalize('NFD');                 
    slug = slug.replace(/[\u0300-\u036f]/g, '');  
    slug = slug.toLowerCase();
    slug = slug.replace(/[^a-z0-9]+/g, '-');      
    slug = slug.replace(/^-+|-+$/g, '');          
    slug = slug.slice(0, 30);                     
    slug = slug.replace(/-+$/g, '');            

    return slug;
}

export function generateResourceId(type) {
    const base = toSlug(type) || 'recurso';

    let id = base;
    let n = 2;
    while (getResourceById(id)) {
        id = base + '-' + n;
        n = n + 1;
    }

    return id;
}

export function createResource(data) {
    const status = db.prepare("SELECT id FROM status WHERE name = 'Disponible'").get();
    const id = generateResourceId(data.type);

    db.prepare(`
        INSERT INTO resource (id, type, brand, model, serialNumber, location, statusId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        data.type,
        data.brand,
        data.model,
        data.serialNumber,
        data.location,
        status ? status.id : null
    );

    return getResourceById(id);
}

export function deleteResource(resourceId) {
    const loans = db.prepare('SELECT COUNT(*) AS total FROM loan WHERE resourceId = ?').get(resourceId);

    if (loans.total > 0) {
        const error = new Error('No se puede eliminar: el recurso tiene ' + loans.total +
            ' préstamo(s) registrado(s)');
        error.status = 409;
        throw error;
    }

    db.exec('BEGIN');
    try {
        const reservations = db.prepare('DELETE FROM reservation WHERE resourceId = ?').run(resourceId);
        db.prepare('DELETE FROM resource WHERE id = ?').run(resourceId);
        db.exec('COMMIT');

        return reservations.changes;
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
}
