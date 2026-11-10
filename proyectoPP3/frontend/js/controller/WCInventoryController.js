import { ENDPOINTS } from '../config.js';
import { callRpc } from '../api.js';
import { loadResources } from '../resources.js';

class WCInventoryController {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }

    loadResources() {
        var self = this;

        this.view.showMessage("Cargando inventario...");

        callRpc(ENDPOINTS.inventory, {})
        .then(function (data) {
            if (data.status !== "success") {
                self.view.showError("No se pudo cargar el inventario: " + (data.message || "Error desconocido"));
                return null;
            }

            return self.loadReservationStates(data.data || []);
        })
        .then(function (resources) {
            if (!resources) return;

            self.model.setResources(resources);
            self.view.render(self.model.getResources());
        })
        .catch(function (error) {
            console.error("Inventory error:", error);
            self.view.showError("No se pudo conectar con el servidor.");
        });
    }

    handleCreate(event) {
        var self = this;

        if (event) event.preventDefault();

        var resource = this.view.getNewResource();

        if (resource.type === "") {
            this.view.showAddError("El tipo de recurso es obligatorio.");
            return;
        }

        if (resource.location === "") {
            this.view.showAddError("La ubicación es obligatoria.");
            return;
        }

        this.view.setAddLoading(true);

        callRpc(ENDPOINTS.createResource, resource)
        .then(function (data) {
            self.view.setAddLoading(false);

            if (data.status !== "success") {
                self.view.showAddError(data.message || "No se pudo agregar el recurso.");
                return;
            }

            self.view.resetAddForm();
            self.view.showAddSuccess(data.message);
            self.loadResources();
        })
        .catch(function (error) {
            console.error("Create resource error:", error);
            self.view.setAddLoading(false);
            self.view.showAddError("No se pudo conectar con el servidor.");
        });
    }

    handleDelete(resource) {
        var self = this;

        var confirmed = window.confirm(
            "¿Eliminar el recurso " + resource.type + " (" + resource.id + ")?\n" +
            "También se borrarán sus reservas. Esta acción no se puede deshacer."
        );
        if (!confirmed) return;

        callRpc(ENDPOINTS.deleteResource, { id: resource.id })
        .then(function (data) {
            if (data.status !== "success") {
                self.view.showError(data.message || "No se pudo eliminar el recurso.");
                return;
            }

            loadResources().then(function () {
                self.loadResources();
            });
        })
        .catch(function (error) {
            console.error("Delete resource error:", error);
            self.view.showError("No se pudo conectar con el servidor.");
        });
    }

    loadReservationStates(resources) {
        var self = this;
        var today = this.model.today();
        var requests = [];

        for (var i = 0; i < resources.length; i++) {
            requests.push(this.buildReservationRequest(resources[i], today));
        }

        return Promise.all(requests).then(function (items) {
            return items;
        });
    }

    buildReservationRequest(resource, today) {
        var self = this;

        var payload = {
            resource: resource.id,
            startTime: "06:00",
            endTime: "23:59"
        };

        return callRpc(ENDPOINTS.getAvailability, payload)
        .then(function (data) {
            var reserved = false;

            if (data.status === "success" && data.data && Array.isArray(data.data.occupiedZone)) {
                reserved = self.hasReservationOnDay(data.data.occupiedZone, today);
            }

            return self.withReservation(resource, reserved);
        })
        .catch(function (error) {
            console.error("Availability error (" + resource.id + "):", error);
            return self.withReservation(resource, false);
        });
    }

    hasReservationOnDay(blocks, day) {
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].dateTime.split(' ')[0] === day) {
                return true;
            }
        }

        return false;
    }

    withReservation(resource, reserved) {
        return {
            id: resource.id,
            type: resource.type,
            brand: resource.brand,
            model: resource.model,
            location: resource.location,
            statusId: resource.statusId,
            status: resource.status,
            reserved: reserved
        };
    }
}

export { WCInventoryController };
