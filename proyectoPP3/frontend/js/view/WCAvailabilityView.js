import { RESOURCES } from '../config.js';
import { WCAvailabilityModel } from '../model/WCAvailabilityModel.js';
import { WCAvailabilityController } from '../controller/WCAvailabilityController.js';
import { attachViewShadow } from '../shadow.js';
import { getSession } from '../session.js';
import { loadResources } from '../resources.js';

class WCAvailabilityView extends HTMLElement {
    constructor() {
        super();
        this.root = attachViewShadow(this);

        this.container = document.createElement("div");
        this.container.className = "w3-container w3-padding-32";

        this.h1 = document.createElement("h1");
        this.h1.textContent = "Disponibilidad del recurso";

        this.message = document.createElement("p");
        this.message.className = "w3-text-grey w3-center w3-padding-16";

        this.container.appendChild(this.h1);
        this.buildLoginNotice();
        this.container.appendChild(this.message);

        this.buildControls();
        this.buildActions();
        this.buildTable();

        this.root.appendChild(this.container);

        this.model = new WCAvailabilityModel();
        this.controller = new WCAvailabilityController(this, this.model);

        this.selectResource.value = this.model.resource;
        this.inputDay.value = this.model.day;

        this._boundVerify = this.controller.handleVerify.bind(this.controller);
        this._boundApply = this.controller.handleApply.bind(this.controller);
        this._boundRelease = this.controller.handleRelease.bind(this.controller);
        this._boundClear = this.controller.handleClear.bind(this.controller);
        this._boundRefresh = this.controller.handleRefresh.bind(this.controller);
        this._boundBlockClick = this.controller.handleBlockClick.bind(this.controller);

        this.controller.loadAvailability(null);

        loadResources().then(this.refreshResourceOptions.bind(this));
    }

    refreshResourceOptions() {
        var selected = this.selectResource.value;
        var existing = [];

        for (var k = this.selectResource.options.length - 1; k >= 0; k--) {
            if (RESOURCES.indexOf(this.selectResource.options[k].value) === -1) {
                this.selectResource.remove(k);
            }
        }

        for (var i = 0; i < this.selectResource.options.length; i++) {
            existing.push(this.selectResource.options[i].value);
        }

        for (var j = 0; j < RESOURCES.length; j++) {
            if (existing.indexOf(RESOURCES[j]) === -1) {
                var opt = document.createElement("option");
                opt.value = RESOURCES[j];
                opt.textContent = RESOURCES[j].toUpperCase();
                this.selectResource.appendChild(opt);
            }
        }

        if (RESOURCES.indexOf(selected) !== -1) {
            this.selectResource.value = selected;
        } else if (RESOURCES.length > 0) {
            this.selectResource.value = RESOURCES[0];
            this.controller.loadAvailability(null);
        } else {
            this.showError("No hay recursos cargados en el inventario.");
        }
    }

    connectedCallback() {
        this.btnVerify.onclick = this._boundVerify;
        this.btnApply.onclick = this._boundApply;
        this.btnRelease.onclick = this._boundRelease;
        this.btnClear.onclick = this._boundClear;

        this.selectResource.onchange = this._boundRefresh;
        this.inputDay.onchange = this._boundRefresh;
        this.inputFrom.onchange = this._boundRefresh;
        this.inputTo.onchange = this._boundRefresh;

        this.addEventListener("block-click", this._boundBlockClick);
    }

    disconnectedCallback() {
        this.btnVerify.onclick = null;
        this.btnApply.onclick = null;
        this.btnRelease.onclick = null;
        this.btnClear.onclick = null;

        this.selectResource.onchange = null;
        this.inputDay.onchange = null;
        this.inputFrom.onchange = null;
        this.inputTo.onchange = null;

        this.removeEventListener("block-click", this._boundBlockClick);
    }

    buildControls() {
        this.controls = document.createElement("div");
        this.controls.className = "w3-margin-bottom w3-padding w3-white w3-card w3-round";

        var labelResource = document.createElement("label");
        labelResource.textContent = "Recurso: ";
        this.selectResource = document.createElement("select");
        this.selectResource.className = "w3-select w3-border w3-round w3-margin-right";
        this.selectResource.style.width = "170px";
        this.selectResource.style.display = "inline-block";

        for (var i = 0; i < RESOURCES.length; i++) {
            var opt = document.createElement("option");
            opt.value = RESOURCES[i];
            opt.textContent = RESOURCES[i].toUpperCase();
            this.selectResource.appendChild(opt);
        }

        var labelDay = document.createElement("label");
        labelDay.textContent = " Día: ";
        this.inputDay = document.createElement("input");
        this.inputDay.type = "date";
        this.inputDay.className = "w3-input w3-border w3-round w3-margin-right";
        this.inputDay.style.width = "160px";
        this.inputDay.style.display = "inline-block";

        var labelFrom = document.createElement("label");
        labelFrom.textContent = " Desde: ";
        this.inputFrom = document.createElement("input");
        this.inputFrom.type = "time";
        this.inputFrom.value = "08:00";
        this.inputFrom.className = "w3-input w3-border w3-round w3-margin-right";
        this.inputFrom.style.width = "120px";
        this.inputFrom.style.display = "inline-block";

        var labelTo = document.createElement("label");
        labelTo.textContent = " Hasta: ";
        this.inputTo = document.createElement("input");
        this.inputTo.type = "time";
        this.inputTo.value = "23:30";
        this.inputTo.className = "w3-input w3-border w3-round w3-margin-right";
        this.inputTo.style.width = "120px";
        this.inputTo.style.display = "inline-block";

        this.btnVerify = document.createElement("button");
        this.btnVerify.textContent = "Verificar disponibilidad";
        this.btnVerify.className = "w3-button w3-teal w3-round";

        this.controls.appendChild(labelResource);
        this.controls.appendChild(this.selectResource);
        this.controls.appendChild(labelDay);
        this.controls.appendChild(this.inputDay);
        this.controls.appendChild(labelFrom);
        this.controls.appendChild(this.inputFrom);
        this.controls.appendChild(labelTo);
        this.controls.appendChild(this.inputTo);
        this.controls.appendChild(this.btnVerify);

        this.container.appendChild(this.controls);
    }

    buildActions() {
        this.actionBar = document.createElement("div");
        this.actionBar.className = "w3-margin-bottom w3-padding w3-white w3-card w3-round";

        this.spanSelection = document.createElement("span");
        this.spanSelection.className = "w3-text-grey w3-margin-right";
        this.spanSelection.textContent = "Selección: (ningún bloque)";

        this.btnApply = document.createElement("button");
        this.btnApply.textContent = "Aplicar reserva";
        this.btnApply.className = "w3-button w3-orange w3-round";
        this.btnApply.disabled = true;
        this.btnApply.style.display = "none";

        this.btnRelease = document.createElement("button");
        this.btnRelease.textContent = "Liberar selección";
        this.btnRelease.className = "w3-button w3-green w3-round";
        this.btnRelease.disabled = true;
        this.btnRelease.style.display = "none";

        this.btnClear = document.createElement("button");
        this.btnClear.textContent = "Limpiar selección";
        this.btnClear.className = "w3-button w3-light-grey w3-round w3-margin-left";

        this.actionBar.appendChild(this.spanSelection);
        this.actionBar.appendChild(this.btnApply);
        this.actionBar.appendChild(this.btnRelease);
        this.actionBar.appendChild(this.btnClear);

        this.container.appendChild(this.actionBar);
    }

    buildTable() {
        this.tableWrapper = document.createElement("div");
        this.container.appendChild(this.tableWrapper);
    }

    showMessage(text) {
        this.message.textContent = text;
        this.message.className = "w3-text-grey w3-center w3-padding-16";
    }

    showError(text) {
        this.message.textContent = text;
        this.message.className = "w3-text-red w3-center w3-padding-16";
    }

    showSuccess(text) {
        this.message.textContent = text;
        this.message.className = "w3-text-green w3-center w3-padding-16";
    }

    updateSelectionSpan(range, done) {
        if (!range) {
            this.spanSelection.textContent = "Selección: (ningún bloque)";
        } else if (!done) {
            this.spanSelection.textContent = "Seleccionado desde " + range.startTime + " · elegí el horario hasta";
        } else {
            this.spanSelection.textContent = "Seleccionado desde " + range.startTime + " hasta " + range.endTime;
        }
    }

    buildLoginNotice() {
        if (getSession()) return;

        var notice = document.createElement("div");
        notice.className = "w3-panel w3-pale-yellow w3-leftbar w3-border-yellow";

        var text = document.createElement("p");
        text.appendChild(document.createTextNode("Estás viendo el calendario sin iniciar sesión. Para reservar, "));

        var login = document.createElement("a");
        login.href = "#login";
        login.textContent = "iniciá sesión";
        text.appendChild(login);

        text.appendChild(document.createTextNode(" o "));

        var register = document.createElement("a");
        register.href = "#registro";
        register.textContent = "registrate como profesor";
        text.appendChild(register);

        text.appendChild(document.createTextNode("."));
        notice.appendChild(text);
        this.container.appendChild(notice);
    }

    updateActionButtons(type) {
        if (type === "free") {
            this.btnApply.style.display = getSession() ? "inline-block" : "none";
            this.btnApply.disabled = false;
            this.btnRelease.style.display = "none";
        } else if (type === "occupied") {
            this.btnApply.style.display = "none";
            this.btnRelease.style.display = getSession() ? "inline-block" : "none";
            this.btnRelease.disabled = false;
        } else {
            this.btnApply.style.display = "none";
            this.btnRelease.style.display = "none";
        }
    }

    clearTable() {
        this.tableWrapper.replaceChildren();
    }

    getFormData() {
        return {
            resource: this.selectResource.value,
            day: this.inputDay.value,
            startTime: this.inputFrom.value,
            endTime: this.inputTo.value
        };
    }

    render(blocks, selection, rangeDone) {
        this.clearTable();

        if (!blocks || blocks.length === 0) {
            this.showMessage("No hay bloques disponibles en este rango horario.");
            return;
        }

        this.message.textContent = "";
        this.message.className = "";

        var table = document.createElement("table");
        table.className = "w3-table w3-white w3-card w3-striped";

        var thead = document.createElement("thead");
        var trHead = document.createElement("tr");
        trHead.className = "w3-teal";

        var headers = ["Hora", "Estado", "Ocupado por"];
        for (var h = 0; h < headers.length; h++) {
            var th = document.createElement("th");
            th.textContent = headers[h];
            trHead.appendChild(th);
        }
        thead.appendChild(trHead);
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        var self = this;

        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var row = document.createElement("tr");
            row.dataset.dateTime = block.dateTime;
            row.style.cursor = "pointer";

            var isSelected = selection.indexOf(block.dateTime) !== -1;

            if (block.past) {
                row.className = block.occupied ? "w3-orange w3-text-white w3-opacity" : "w3-light-grey w3-text-grey";
                row.style.cursor = "default";
            } else if (block.occupied && isSelected) {
                row.className = "w3-deep-orange w3-text-white";
            } else if (block.occupied) {
                row.className = "w3-orange w3-text-white w3-hover-amber";
            } else if (isSelected) {
                row.className = "w3-blue w3-text-white";
            } else {
                row.className = "w3-hover-light-grey";
            }

            var tdDateTime = document.createElement("td");
            tdDateTime.textContent = block.dateTime ? block.dateTime.split(' ')[1] : "Sin hora";
            row.appendChild(tdDateTime);

            var tdStatus = document.createElement("td");
            var isFirst = selection[0] === block.dateTime;
            var isLast = selection[selection.length - 1] === block.dateTime;

            if (block.occupied && isSelected) {
                tdStatus.textContent = "Seleccionado para liberar";
            } else if (block.occupied) {
                tdStatus.textContent = "Ocupado";
            } else if (block.past) {
                tdStatus.textContent = "Pasado";
            } else if (isSelected) {
                if (isFirst && isLast) {
                    tdStatus.textContent = rangeDone ? "Desde y hasta" : "Desde";
                } else if (isFirst) {
                    tdStatus.textContent = "Desde";
                } else if (isLast) {
                    tdStatus.textContent = "Hasta";
                } else {
                    tdStatus.textContent = "Seleccionado";
                }
            } else {
                tdStatus.textContent = "Libre";
            }
            tdStatus.className = "w3-center";
            row.appendChild(tdStatus);

            var tdTeacher = document.createElement("td");
            tdTeacher.textContent = block.teacher || "—";
            tdTeacher.className = "w3-center";
            row.appendChild(tdTeacher);

            row.onclick = function () {
                var event = new CustomEvent("block-click", {
                    detail: { dateTime: this.dataset.dateTime }
                });
                self.dispatchEvent(event);
            };

            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        this.tableWrapper.appendChild(table);
    }
}

customElements.define("wc-availability-view", WCAvailabilityView);

export { WCAvailabilityView };
