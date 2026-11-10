import { ENDPOINTS } from '../config.js';
import { callRpc } from '../api.js';
import { getSession } from '../session.js';

class WCAvailabilityController {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }

    syncModelFromInputs(data) {
        this.model.setResource(data.resource);
        this.model.setDay(data.day);
        this.model.setRange(data.startTime, data.endTime);
    }

    isGridOutdated() {
        return this.view.selectResource.value !== this.model.resource ||
               this.view.inputDay.value !== this.model.day;
    }

    warnOutdatedGrid() {
        this.loadAvailability({
            text: "Cambiaste el recurso o el día. Se actualizó la grilla: elegí los bloques de nuevo.",
            error: true
        });
    }

    handleRefresh() {
        this.loadAvailability(null);
    }

    handleVerify() {
        this.loadAvailability(null);
    }

    loadAvailability(result) {
        var self = this;
        this.syncModelFromInputs(this.view.getFormData());

        if (!this.model.day) {
            this.view.showError("Elegí un día.");
            return;
        }

        this.view.h1.textContent = "Disponibilidad: " + this.model.resource.toUpperCase();
        this.view.showMessage("Verificando disponibilidad...");

        this.model.clearSelection();
        this.view.updateSelectionSpan(null);
        this.view.updateActionButtons("empty");

        var payload = {
            resource: this.model.resource,
            startTime: this.model.startTime,
            endTime: this.model.endTime
        };

        callRpc(ENDPOINTS.getAvailability, payload)
        .then(function (data) {
            if (data.status !== "success") {
                self.view.showError("Error del servidor: " + (data.message || "Desconocido"));
                return;
            }

            self.model.intervalDuration = data.data.intervalDuration || 30;
            self.model.setOccupiedZone(data.data.occupiedZone || []);

            self.model.generateGrid();
            self.model.crossOccupied();

            self.view.render(self.model.visibleBlocks(), self.model.selection, self.model.selectionComplete);

            if (result) {
                if (result.error) {
                    self.view.showError(result.text);
                } else {
                    self.view.showSuccess(result.text);
                }
            }
        })
        .catch(function (error) {
            console.error("Fetch error:", error);
            self.view.showError("No se pudo conectar con el servidor.");
        });
    }

    handleBlockClick(event) {
        if (!getSession()) {
            this.view.showError("Iniciá sesión para reservar o liberar bloques.");
            return;
        }

        var block = this.model.findBlock(event.detail.dateTime);
        if (block && block.past) {
            this.view.showError("Ese horario ya pasó: solo se puede consultar.");
            return;
        }

        var step = this.model.selectBlock(event.detail.dateTime);

        var range = this.model.selectedRange();
        this.view.updateSelectionSpan(range, this.model.selectionComplete);

        var type = this.model.selectionType();

        var notOwned = type === "occupied" && !this.canReleaseSelection();
        this.view.updateActionButtons(notOwned ? "foreign" : type);

        this.view.render(this.model.visibleBlocks(), this.model.selection, this.model.selectionComplete);

        if (step === "before") {
            this.view.showError("El horario hasta no puede ser anterior al desde.");
        } else if (notOwned) {
            this.view.showError("Solo podés cancelar tus propias reservas.");
        } else if (type === "mixed") {
            this.view.showError("La selección mezcla bloques libres y ocupados.");
        }
    }

    canReleaseSelection() {
        var session = getSession();
        if (!session) return false;
        return session.groups.indexOf("admin") !== -1 || this.model.selectionOwnedBy(session.name);
    }

    handleClear() {
        this.model.clearSelection();
        this.view.updateSelectionSpan(null);
        this.view.updateActionButtons("empty");
        this.view.render(this.model.visibleBlocks(), this.model.selection, this.model.selectionComplete);
    }

    handleApply() {
        var self = this;

        if (!getSession()) {
            this.view.showError("Tenés que iniciar sesión para reservar.");
            return;
        }

        if (this.isGridOutdated()) {
            this.warnOutdatedGrid();
            return;
        }

        var range = this.model.selectedRange();

        if (!range) {
            this.view.showError("Seleccioná al menos un bloque.");
            return;
        }

        if (this.model.selectionType() !== "free") {
            this.view.showError("Solo podés reservar bloques libres (sin mezclar con ocupados).");
            return;
        }

        var verification = this.model.checkAvailability(range.startTime, range.endTime);
        if (verification.available === false) {
            this.view.showError(verification.reason);
            return;
        }

        var session = getSession();
        var teacher;

        if (session.groups.indexOf("admin") === -1) {
            teacher = session.name;
            if (!window.confirm("¿Reservar a nombre de " + teacher + "?")) return;
        } else {
            teacher = window.prompt("Nombre del docente:", session.name);
            if (teacher === null) return;
            teacher = teacher.trim();
            if (teacher === "") {
                this.view.showError("El nombre del docente no puede estar vacío.");
                return;
            }
        }

        this.model.applyReservation(range.startTime, range.endTime, teacher);

        var finalState = this.model.finalStateToSave();

        this.view.showMessage("Guardando reserva...");

        var payload = {
            resource: this.model.resource,
            blocks: finalState
        };

        callRpc(ENDPOINTS.applyReservation, payload)
        .then(function (data) {
            self.loadAvailability({
                text: data.message || (data.status === "success" ? "Reserva guardada" : "No se pudo reservar"),
                error: data.status !== "success"
            });
        })
        .catch(function (error) {
            console.error("Fetch error:", error);
            self.view.showError("No se pudo conectar con el servidor.");
        });
    }

    handleRelease() {
        var self = this;

        if (this.isGridOutdated()) {
            this.warnOutdatedGrid();
            return;
        }

        if (this.model.selection.length === 0) {
            this.view.showError("Seleccioná al menos un bloque ocupado.");
            return;
        }

        if (this.model.selectionType() !== "occupied") {
            this.view.showError("Solo podés liberar bloques ocupados (sin mezclar con libres).");
            return;
        }

        if (!this.canReleaseSelection()) {
            this.view.showError("Solo podés cancelar tus propias reservas.");
            return;
        }

        var confirmed = window.confirm(
            "¿Liberar " + this.model.selection.length + " bloque(s)?\n" +
            "Los docentes asignados quedarán sin reserva."
        );
        if (!confirmed) return;

        this.model.releaseSelection();

        var finalState = this.model.finalStateToSave();

        this.view.showMessage("Guardando liberación...");

        var payload = {
            resource: this.model.resource,
            blocks: finalState
        };

        callRpc(ENDPOINTS.applyReservation, payload)
        .then(function (data) {
            self.loadAvailability({
                text: data.message || (data.status === "success" ? "Bloques liberados" : "No se pudo liberar"),
                error: data.status !== "success"
            });
        })
        .catch(function (error) {
            console.error("Fetch error:", error);
            self.view.showError("No se pudo conectar con el servidor.");
        });
    }
}

export { WCAvailabilityController };
