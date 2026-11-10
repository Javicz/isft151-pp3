import db from "../server/database.js";
import { insertUser, assignUserToGroup } from "../repositories/userRepository.js";
import { getUserByUsername } from "../repositories/authRepository.js";

function registrationError(message, status)
{
    const error = new Error(message);
    error.status = status;
    return error;
}

export function register(username, password)
{
    if (typeof username !== 'string' || typeof password !== 'string')
    {
        throw registrationError('Ingresá usuario y contraseña', 400);
    }

    username = username.trim();

    if (username.length < 3 || username.length > 30)
    {
        throw registrationError('El usuario debe tener entre 3 y 30 caracteres', 400);
    }

    if (password.length < 4)
    {
        throw registrationError('La contraseña debe tener al menos 4 caracteres', 400);
    }

    if (getUserByUsername(username))
    {
        throw registrationError('Ese usuario ya existe', 409);
    }

    const group = db.prepare("SELECT id FROM `group` WHERE name = 'profesor'").get();

    if (!group)
    {
        throw registrationError('No existe el grupo profesor (ejecutá init-db.mjs)', 500);
    }

    db.exec('BEGIN');
    try
    {
        const user = insertUser(username, password);
        assignUserToGroup(user.id, group.id);
        db.exec('COMMIT');

        return { id: user.id, username: user.username, group: 'profesor' };
    }
    catch (error)
    {
        db.exec('ROLLBACK');
        throw error;
    }
}
