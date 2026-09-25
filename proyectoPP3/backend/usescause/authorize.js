import db from "../server/database.js";
import { userSessions } from "./sessions.js";

const publicRoutes =[
    '/login',
    '/register'
];

export function isPublicRoute(path)
{
    return publicRoutes.includes(path);
}

export function getSessionFromRequest(req)
{
    const userId =
        parseInt(
            req.headers['x-user-id']
        );

    const apiKey =
        req.headers['x-api-key'];

    if (isNaN(userId))
    {
        return null;
    }

    const session = userSessions.get(userId);

    if (!session)
    {
        return null;
    }

    if (session.apiKey !== apiKey)
    {
        return null;
    }

    return session;
}
export function authorize(id_user, endpointPath)
{
    const sql = `
        SELECT count(*) as total
        FROM access a
        JOIN members m ON a.id_group = m.id_group
        JOIN endpoint e ON a.id_endpoint = e.id
        WHERE m.id_user = ?
          AND e.path = ?
    `;

    try
    {
        const stmt = db.prepare(sql);

        const row =
            stmt.get(
                id_user,
                endpointPath
            );

        return row.total > 0;
    }
    catch (err)
    {
        console.error(
            'Error consultando permisos:',
            err
        );

        throw err;
    }
}