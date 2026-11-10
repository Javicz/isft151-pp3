export function getSession() {
    try {
        var userId = localStorage.getItem("userId");
        var apiKey = localStorage.getItem("apiKey");
        if (!userId || !apiKey) return null;

        var groups = JSON.parse(localStorage.getItem("groups") || "[]").map(function (g) {
            return g.name;
        });

        return {
            userId: userId,
            apiKey: apiKey,
            name: localStorage.getItem("username") || "",
            role: groups.join(", "),
            groups: groups
        };
    } catch (error) {
        return null;
    }
}

export function saveSession(result) {
    if (!result) return;

    localStorage.setItem("userId", result.id);
    localStorage.setItem("apiKey", result.apiKey);
    localStorage.setItem("username", result.username);
    localStorage.setItem("groups", JSON.stringify(result.groups || []));

    window.dispatchEvent(new CustomEvent("session-change"));
}

export function authHeaders() {
    var session = getSession();
    if (!session) return {};
    return { "x-user-id": session.userId, "x-api-key": session.apiKey };
}

export function closeSession() {
    try {
        localStorage.removeItem("userId");
        localStorage.removeItem("apiKey");
        localStorage.removeItem("username");
        localStorage.removeItem("groups");
    } catch (error) {
    }
    window.dispatchEvent(new CustomEvent("session-change"));
}
