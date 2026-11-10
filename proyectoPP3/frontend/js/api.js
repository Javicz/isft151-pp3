import { API_URL } from './config.js';
import { getSession, authHeaders, closeSession } from './session.js';

export function callRpc(endpoint, data) {
    var hadSession = getSession() !== null;

    var headers = { "Content-Type": "application/json" };
    var auth = authHeaders();
    for (var key in auth) {
        headers[key] = auth[key];
    }

    return fetch(API_URL + endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(function (response) {
        return response.text().then(function (text) {
            if (response.status === 401) {
                closeSession();
                return {
                    status: "error",
                    message: hadSession
                        ? "Tu sesión expiró. Iniciá sesión de nuevo."
                        : "Tenés que iniciar sesión para hacer esto."
                };
            }
            if (response.status === 403) {
                return { status: "error", message: "No tenés permiso para hacer esto." };
            }

            try {
                return JSON.parse(text);
            } catch (error) {
                return { status: "error", message: text || "Respuesta inesperada del servidor" };
            }
        });
    });
}
