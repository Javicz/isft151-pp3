import { ScheduleManager, BusinessError } from '../usescause/ScheduleManager.js';
import { readBlocks, saveBlocks } from '../repositories/blocksRepository.js';
import { getSessionFromRequest, authorize } from '../usescause/authorize.js';
import { insertReservations, deleteReservations } from '../repositories/reservationRepository.js';

const manager = new ScheduleManager();

function isValidTime(time) {
    if (typeof time !== 'string') return false;
    return /^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$/.test(time);
}

function readBody(req) {
    return new Promise(function (resolve) {
        let body = '';
        req.on('data', function (chunk) { body += chunk; });
        req.on('end', function () { resolve(body); });
    });
}

async function readJson(req) {
    const body = await readBody(req);
    try {
        return JSON.parse(body || '{}');
    } catch (error) {
        throw new BusinessError('El cuerpo de la petición no es un JSON válido', 400);
    }
}

function respondJson(res, statusCode, object) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(object));
}

function respondError(res, error) {
    if (error instanceof BusinessError) {
        return respondJson(res, error.status, { status: 'error', message: error.message });
    }
    console.error(error);
    respondJson(res, 500, { status: 'error', message: error.message });
}

function validateResource(resource) {
    if (!manager.isValidResource(resource)) {
        throw new BusinessError('Recurso inexistente: ' + resource, 400);
    }
}

function isAdmin(session) {
    if (!session) return false;
    return authorize(session.userId, '/api/reservations/cancel');
}

function whoReserves(session, indicatedName) {
    if (isAdmin(session) && indicatedName) return indicatedName;
    return session.username;
}

function normalizeFinalState(blocks) {
    if (!Array.isArray(blocks)) {
        throw new BusinessError('bloques debe ser un array', 400);
    }

    const byDateTime = new Map();

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (typeof block !== 'object' || block === null) {
            throw new BusinessError('Bloque inválido en posición ' + i, 400);
        }
        if (!manager.isValidDateTime(block.dateTime)) {
            throw new BusinessError('dateTime inválido en bloque ' + i, 400);
        }
        if (block.occupied !== true) {
            continue;
        }

        const teacher = typeof block.teacher === 'string' && block.teacher.trim() !== ''
            ? block.teacher.trim()
            : null;

        byDateTime.set(block.dateTime, {
            dateTime: block.dateTime,
            occupied: true,
            teacher: teacher
        });
    }

    const finalState = [];
    byDateTime.forEach(function (block) {
        finalState.push(block);
    });

    finalState.sort(function (a, b) {
        return a.dateTime < b.dateTime ? -1 : 1;
    });

    return finalState;
}

export async function getAvailabilityHandler(req, res) {
    try {
        const data = await readJson(req);

        const resource = data.resource || 'impresora';
        const startTime = data.startTime || '06:00';
        const endTime = data.endTime || '24:00';

        validateResource(resource);
        if (!isValidTime(startTime) || !isValidTime(endTime)) {
            throw new BusinessError('Formato de hora inválido (HH:MM)', 400);
        }

        const savedBlocks = readBlocks(resource);

        respondJson(res, 200, {
            status: 'success',
            data: manager.buildRawResponse(savedBlocks, startTime, endTime, null)
        });

    } catch (error) {
        respondError(res, error);
    }
}

export async function applyReservationHandler(req, res) {
    try {
        const data = await readJson(req);

        validateResource(data.resource);

        const finalState = normalizeFinalState(data.blocks);
        const previous = readBlocks(data.resource);
        const session = getSessionFromRequest(req);

        const previousByDateTime = new Map();
        previous.forEach(function (block) { previousByDateTime.set(block.dateTime, block); });

        const finalByDateTime = new Map();
        finalState.forEach(function (block) { finalByDateTime.set(block.dateTime, block); });

        const newBlocks = [];
        for (let i = 0; i < finalState.length; i++) {
            const block = finalState[i];
            const previousBlock = previousByDateTime.get(block.dateTime);

            if (!previousBlock) {
                newBlocks.push(block);
            } else if (block.teacher !== (previousBlock.teacher || null)) {
                throw new BusinessError(
                    'El recurso ya está ocupado el ' + block.dateTime +
                    (previousBlock.teacher ? ' (' + previousBlock.teacher + ')' : ''), 409);
            }
        }

        const removed = previous.filter(function (block) { return !finalByDateTime.has(block.dateTime); });

        let result;
        let message;

        if (newBlocks.length > 0) {
            if (!session) {
                throw new BusinessError('Tenés que iniciar sesión para reservar', 401);
            }

            if (manager.hasPastBlock(newBlocks)) {
                throw new BusinessError('No se puede reservar en un horario que ya pasó', 400);
            }

            const teacher = whoReserves(session, newBlocks[0].teacher);
            const toAdd = manager.buildNewBlocks(newBlocks.map(function (block) { return block.dateTime; }), teacher);
            if (toAdd.length !== newBlocks.length) {
                throw new BusinessError('Hay bloques fuera de la grilla horaria', 400);
            }

            result = manager.mergeBlocks(previous, toAdd).sort(function (a, b) {
                return a.dateTime < b.dateTime ? -1 : 1;
            });
            saveBlocks(data.resource, result);

            try {
                insertReservations(data.resource, session.userId, toAdd);
            } catch (dbError) {
                saveBlocks(data.resource, previous);
                throw dbError;
            }

            message = 'Reserva guardada a nombre de ' + teacher + ' (' + toAdd.length + ' bloque/s)';

        } else if (removed.length > 0) {
            if (!session) {
                throw new BusinessError('Tenés que iniciar sesión para liberar reservas', 401);
            }
            if (manager.hasPastBlock(removed)) {
                throw new BusinessError('No se pueden liberar reservas de horarios que ya pasaron', 400);
            }
            if (!isAdmin(session)) {
                const notOwned = removed.some(function (block) { return block.teacher !== session.username; });
                if (notOwned) {
                    throw new BusinessError('Solo podés cancelar tus propias reservas', 403);
                }
            }

            const dateTimes = removed.map(function (block) { return block.dateTime; });
            result = previous.filter(function (block) { return finalByDateTime.has(block.dateTime); });
            saveBlocks(data.resource, result);

            try {
                deleteReservations(data.resource, dateTimes);
            } catch (dbError) {
                saveBlocks(data.resource, previous);
                throw dbError;
            }

            message = 'Bloques liberados: ' + removed.length;

        } else {
            message = 'No había cambios para guardar';
        }

        respondJson(res, 200, { status: 'success', message: message });

    } catch (error) {
        respondError(res, error);
    }
}

export async function releaseReservationHandler(req, res) {
    try {
        const data = await readJson(req);

        validateResource(data.resource);
        const dateTimes = manager.normalizeBlocks(data.blocks);

        if (manager.hasPastBlock(dateTimes.map(function (dateTime) { return { dateTime: dateTime }; }))) {
            throw new BusinessError('No se pueden liberar reservas de horarios que ya pasaron', 400);
        }

        const savedBlocks = readBlocks(data.resource);
        const result = manager.release(savedBlocks, dateTimes);

        if (result.released === 0) {
            throw new BusinessError('Esos bloques ya estaban libres', 409);
        }

        saveBlocks(data.resource, result.blocks);

        try {
            deleteReservations(data.resource, dateTimes);
        } catch (dbError) {
            saveBlocks(data.resource, savedBlocks);
            throw dbError;
        }

        respondJson(res, 200, {
            status: 'success',
            message: 'Bloques liberados: ' + result.released
        });

    } catch (error) {
        respondError(res, error);
    }
}
