import { getAllResources, createResource, getResourceById, deleteResource } from '../repositories/resourceRepository.js';
import { deleteBlocks } from '../repositories/blocksRepository.js';
import { getSessionFromRequest, authorize } from '../usescause/authorize.js';

function respondJson(res, statusCode, object) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(object));
}

export function listResourcesHandler(req, res) {
    try {
        const resources = getAllResources();

        respondJson(res, 200, {
            status: 'success',
            data: resources
        });
    } catch (error) {
        console.error(error);
        respondJson(res, 500, {
            status: 'error',
            message: error.message
        });
    }
}

function optionalText(value, name, max) {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const text = String(value).trim();
    if (text.length > max) {
        const error = new Error(name + ' no puede superar los ' + max + ' caracteres');
        error.status = 400;
        throw error;
    }
    return text;
}

function readBody(req) {
    return new Promise(function (resolve) {
        let body = '';
        req.on('data', function (chunk) { body += chunk; });
        req.on('end', function () { resolve(body); });
    });
}

export async function createResourceHandler(req, res) {
    try {
        const session = getSessionFromRequest(req);

        if (!session) {
            return respondJson(res, 401, { status: 'error', message: 'Tenés que iniciar sesión' });
        }
        if (!authorize(session.userId, '/api/reservations/cancel')) {
            return respondJson(res, 403, { status: 'error', message: 'Solo el administrador puede agregar recursos' });
        }

        let data;
        try {
            data = JSON.parse((await readBody(req)) || '{}');
        } catch (error) {
            return respondJson(res, 400, { status: 'error', message: 'El cuerpo de la petición no es un JSON válido' });
        }

        const type = optionalText(data.type, 'El tipo', 40);
        const location = optionalText(data.location, 'La ubicación', 80);

        if (type === null) {
            return respondJson(res, 400, { status: 'error', message: 'El tipo de recurso es obligatorio' });
        }
        if (location === null) {
            return respondJson(res, 400, { status: 'error', message: 'La ubicación es obligatoria' });
        }

        const resource = createResource({
            type: type,
            brand: optionalText(data.brand, 'La marca', 60),
            model: optionalText(data.model, 'El modelo', 60),
            serialNumber: optionalText(data.serialNumber, 'El número de serie', 60),
            location: location
        });

        respondJson(res, 200, {
            status: 'success',
            message: 'Recurso agregado: ' + resource.id,
            data: resource
        });
    } catch (error) {
        if (error.status) {
            return respondJson(res, error.status, { status: 'error', message: error.message });
        }
        if (/UNIQUE/.test(error.message)) {
            return respondJson(res, 409, { status: 'error', message: 'Ya existe un recurso con ese número de serie' });
        }
        console.error(error);
        respondJson(res, 500, { status: 'error', message: error.message });
    }
}

export async function deleteResourceHandler(req, res) {
    try {
        const session = getSessionFromRequest(req);

        if (!session) {
            return respondJson(res, 401, { status: 'error', message: 'Tenés que iniciar sesión' });
        }
        if (!authorize(session.userId, '/api/reservations/cancel')) {
            return respondJson(res, 403, { status: 'error', message: 'Solo el administrador puede eliminar recursos' });
        }

        let data;
        try {
            data = JSON.parse((await readBody(req)) || '{}');
        } catch (error) {
            return respondJson(res, 400, { status: 'error', message: 'El cuerpo de la petición no es un JSON válido' });
        }

        if (typeof data.id !== 'string' || data.id.trim() === '') {
            return respondJson(res, 400, { status: 'error', message: 'Indicá qué recurso eliminar' });
        }

        const resource = getResourceById(data.id);
        if (!resource) {
            return respondJson(res, 404, { status: 'error', message: 'El recurso no existe' });
        }

        const reservations = deleteResource(resource.id);
        deleteBlocks(resource.id);

        respondJson(res, 200, {
            status: 'success',
            message: 'Recurso eliminado: ' + resource.id +
                (reservations > 0 ? ' (también se borraron ' + reservations + ' bloque/s reservado/s)' : '')
        });
    } catch (error) {
        if (error.status) {
            return respondJson(res, error.status, { status: 'error', message: error.message });
        }
        console.error(error);
        respondJson(res, 500, { status: 'error', message: error.message });
    }
}
