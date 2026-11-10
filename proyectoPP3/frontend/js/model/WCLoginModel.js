import { API_URL, ENDPOINTS } from '../config.js';
import { saveSession, closeSession, getSession } from '../session.js';

class WCLoginModel extends EventTarget {
    constructor() {
        super();
        this.user = getSession();
    }

    authenticate(username, password) {
        return fetch(API_URL + ENDPOINTS.login, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(function (response) {
            return response.json().then(function (data) {
                return {
                    ok: response.ok,
                    data: data
                };
            });
        });
    }

    saveSession(result) {
        saveSession(result);
        this.user = getSession();
        this.dispatchEvent(new CustomEvent("session-saved"));
    }

    logout() {
        closeSession();
        this.user = null;
        this.dispatchEvent(new CustomEvent("session-closed"));
    }

    getSession() {
        return getSession();
    }
}

export { WCLoginModel };
