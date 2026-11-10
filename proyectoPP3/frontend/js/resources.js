import { ENDPOINTS, RESOURCES } from './config.js';
import { callRpc } from './api.js';

export function loadResources() {
    return callRpc(ENDPOINTS.inventory, {})
    .then(function (data) {
        if (data.status === "success" && Array.isArray(data.data)) {
            var ids = data.data.map(function (resource) { return resource.id; });

            var ordered = RESOURCES.filter(function (id) { return ids.indexOf(id) !== -1; });
            for (var i = 0; i < ids.length; i++) {
                if (ordered.indexOf(ids[i]) === -1) ordered.push(ids[i]);
            }

            RESOURCES.splice(0, RESOURCES.length);
            for (var j = 0; j < ordered.length; j++) RESOURCES.push(ordered[j]);
        }
        return RESOURCES;
    })
    .catch(function () {
        return RESOURCES;
    });
}
