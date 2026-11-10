import { WCInventoryModel } from '../model/WCInventoryModel.js';
import { WCInventoryController } from '../controller/WCInventoryController.js';
import { attachViewShadow } from '../shadow.js';
import { getSession } from '../session.js';

class WCInventoryView extends HTMLElement {
    constructor() {
        super();
        this.root = attachViewShadow(this);

        this.container = document.createElement("div");
        this.container.className = "w3-container w3-padding-32";

        this.h1 = document.createElement("h1");
        this.h1.textContent = "Inventario";

        this.message = document.createElement("p");
        this.message.className = "w3-text-grey w3-padding-8";

        this.refreshButton = document.createElement("button");
        this.refreshButton.type = "button";
        this.refreshButton.className = "w3-button w3-teal w3-round w3-margin-bottom";
        this.refreshButton.textContent = "Actualizar inventario";

        this.tableWrapper = document.createElement("div");

        this.container.appendChild(this.h1);
        this.container.appendChild(this.message);
        this.container.appendChild(this.refreshButton);
        this.buildAddForm();
        this.container.appendChild(this.tableWrapper);

        this.root.appendChild(this.container);

        this.model = new WCInventoryModel();
        this.controller = new WCInventoryController(this, this.model);
        this._boundRefresh = this.controller.loadResources.bind(this.controller);
        this._boundCreate = this.controller.handleCreate.bind(this.controller);

        this.controller.loadResources();
    }

    connectedCallback() {
        this.refreshButton.onclick = this._boundRefresh;

        if (this.addButton) {
            this.addButton.onclick = this.toggleAddForm.bind(this);
            this.addForm.onsubmit = this._boundCreate;
        }
    }

    disconnectedCallback() {
        this.refreshButton.onclick = null;

        if (this.addButton) {
            this.addButton.onclick = null;
            this.addForm.onsubmit = null;
        }
    }

    buildAddForm() {
        var session = getSession();
        if (!session || session.groups.indexOf("admin") === -1) return;

        this.addButton = document.createElement("button");
        this.addButton.type = "button";
        this.addButton.className = "w3-button w3-green w3-round w3-margin-bottom w3-margin-left";
        this.addButton.textContent = "Agregar recurso";

        this.addForm = document.createElement("form");
        this.addForm.noValidate = true;
        this.addForm.className = "w3-card w3-white w3-round w3-padding w3-margin-bottom";
        this.addForm.style.display = "none";

        var title = document.createElement("h3");
        title.textContent = "Agregar recurso al inventario";
        this.addForm.appendChild(title);

        this.fieldType = this.buildField("Tipo (obligatorio)", "Ej: Notebook, Proyector, Parlante");
        this.fieldBrand = this.buildField("Marca", "Ej: Lenovo");
        this.fieldModel = this.buildField("Modelo", "Ej: ThinkPad E14");
        this.fieldSerial = this.buildField("Número de serie", "Si lo tiene; no puede repetirse");
        this.fieldLocation = this.buildField("Ubicación (obligatoria)", "Ej: Aula 3, Biblioteca");

        this.addSubmit = document.createElement("button");
        this.addSubmit.type = "submit";
        this.addSubmit.className = "w3-button w3-teal w3-round";
        this.addSubmit.textContent = "Guardar recurso";
        this.addForm.appendChild(this.addSubmit);

        this.addMessage = document.createElement("p");
        this.addMessage.className = "w3-text-grey";
        this.addForm.appendChild(this.addMessage);

        this.container.appendChild(this.addButton);
        this.container.appendChild(this.addForm);
    }

    buildField(labelText, placeholder) {
        var group = document.createElement("div");
        group.className = "w3-margin-bottom";

        var label = document.createElement("label");
        label.className = "w3-text-grey";
        label.textContent = labelText;

        var input = document.createElement("input");
        input.type = "text";
        input.className = "w3-input w3-border w3-round";
        input.placeholder = placeholder;

        group.appendChild(label);
        group.appendChild(input);
        this.addForm.appendChild(group);

        return input;
    }

    toggleAddForm() {
        var hidden = this.addForm.style.display === "none";
        this.addForm.style.display = hidden ? "block" : "none";
        this.addButton.textContent = hidden ? "Cancelar" : "Agregar recurso";
        if (hidden) this.fieldType.focus();
    }

    getNewResource() {
        return {
            type: this.fieldType.value.trim(),
            brand: this.fieldBrand.value.trim(),
            model: this.fieldModel.value.trim(),
            serialNumber: this.fieldSerial.value.trim(),
            location: this.fieldLocation.value.trim()
        };
    }

    resetAddForm() {
        this.fieldType.value = "";
        this.fieldBrand.value = "";
        this.fieldModel.value = "";
        this.fieldSerial.value = "";
        this.fieldLocation.value = "";
    }

    setAddLoading(isLoading) {
        this.addSubmit.disabled = isLoading;
        this.addSubmit.textContent = isLoading ? "Guardando..." : "Guardar recurso";
    }

    showAddError(text) {
        this.addMessage.textContent = text;
        this.addMessage.className = "w3-text-red";
    }

    showAddSuccess(text) {
        this.addMessage.textContent = text;
        this.addMessage.className = "w3-text-green";
    }

    showMessage(text) {
        this.message.textContent = text;
        this.message.className = "w3-text-grey w3-padding-8";
    }

    showError(text) {
        this.message.textContent = text;
        this.message.className = "w3-text-red w3-padding-8";
    }

    clearTable() {
        this.tableWrapper.replaceChildren();
    }

    countReserved(resources) {
        var total = 0;

        for (var i = 0; i < resources.length; i++) {
            if (resources[i].reserved === true) total = total + 1;
        }

        return total;
    }

    render(resources) {
        this.clearTable();

        if (!resources || resources.length === 0) {
            this.showMessage("No hay recursos cargados en el inventario.");
            return;
        }

        this.showMessage("Recursos cargados: " + resources.length + " · Reservados hoy: " + this.countReserved(resources));

        var table = document.createElement("table");
        table.className = "w3-table w3-white w3-card w3-striped";

        var thead = document.createElement("thead");
        var trHead = document.createElement("tr");
        trHead.className = "w3-teal";

        var session = getSession();
        var isAdmin = session !== null && session.groups.indexOf("admin") !== -1;

        var headers = ["ID", "Recurso", "Marca", "Modelo", "Ubicación", "Estado"];
        if (isAdmin) headers.push("Acciones");
        for (var h = 0; h < headers.length; h++) {
            var th = document.createElement("th");
            th.textContent = headers[h];
            trHead.appendChild(th);
        }
        thead.appendChild(trHead);
        table.appendChild(thead);

        var tbody = document.createElement("tbody");

        for (var i = 0; i < resources.length; i++) {
            var item = resources[i];
            var row = document.createElement("tr");

            var tdId = document.createElement("td");
            tdId.textContent = item.id;
            row.appendChild(tdId);

            var tdType = document.createElement("td");
            tdType.textContent = item.type;
            row.appendChild(tdType);

            var tdBrand = document.createElement("td");
            tdBrand.textContent = item.brand || "—";
            row.appendChild(tdBrand);

            var tdModel = document.createElement("td");
            tdModel.textContent = item.model || "—";
            row.appendChild(tdModel);

            var tdLocation = document.createElement("td");
            tdLocation.textContent = item.location || "—";
            row.appendChild(tdLocation);

            var tdStatus = document.createElement("td");

            if (item.reserved === true) {
                var tag = document.createElement("span");
                tag.className = "w3-tag w3-orange w3-round";
                tag.textContent = "Reservado";
                tdStatus.appendChild(tag);

                if (item.status) {
                    var statusText = document.createElement("span");
                    statusText.className = "w3-small w3-text-grey w3-margin-left";
                    statusText.textContent = item.status;
                    tdStatus.appendChild(statusText);
                }
            } else {
                tdStatus.textContent = item.status || "Sin estado";
            }

            row.appendChild(tdStatus);

            if (isAdmin) {
                var tdActions = document.createElement("td");
                var deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "w3-button w3-red w3-round w3-small";
                deleteButton.textContent = "Eliminar";
                deleteButton.onclick = this.controller.handleDelete.bind(this.controller, item);
                tdActions.appendChild(deleteButton);
                row.appendChild(tdActions);
            }

            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        this.tableWrapper.appendChild(table);
    }
}

customElements.define("wc-inventory-view", WCInventoryView);

export { WCInventoryView };
