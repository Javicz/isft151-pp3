import { API_URL } from '../config.js';

class WCRegisterModel extends EventTarget {
    constructor() {
        super();
    }

    register(username, password) {
        return fetch(API_URL + "/register", {
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
}

export { WCRegisterModel };
