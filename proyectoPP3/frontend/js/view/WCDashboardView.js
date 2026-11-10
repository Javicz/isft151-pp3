import { APP_NAME, MENU } from '../config.js';
import { WCDashboardModel } from '../model/WCDashboardModel.js';
import { WCDashboardController } from '../controller/WCDashboardController.js';
import { attachViewShadow } from '../shadow.js';

class WCDashboardView extends HTMLElement {
    constructor() {
        super();
        this.root = attachViewShadow(this);

        var style = document.createElement("style");
        style.textContent =
            ".modulo-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }" +
            ".modulo-card.modulo-activo:hover, .modulo-card.modulo-activo:focus-within {" +
            "  transform: translateY(-8px);" +
            "  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.18) !important;" +
            "}" +
            "@media (prefers-reduced-motion: reduce) {" +
            "  .modulo-card { transition: none; }" +
            "  .modulo-card.modulo-activo:hover, .modulo-card.modulo-activo:focus-within { transform: none; }" +
            "}";
        this.root.appendChild(style);

        this.container = document.createElement("div");
        this.container.className = "w3-container w3-padding-32";

        this.h1 = document.createElement("h1");
        this.h1.textContent = APP_NAME;

        this.subtitle = document.createElement("p");
        this.subtitle.className = "w3-text-grey";
        this.subtitle.textContent = "Control, reserva y trazabilidad del equipamiento de la escuela.";

        this.container.appendChild(this.h1);
        this.container.appendChild(this.subtitle);

        this.buildContent();

        this.root.appendChild(this.container);

        this.model = new WCDashboardModel();
        this.controller = new WCDashboardController(this, this.model);
        this.controller.start();
    }

    buildContent() {
        this.contentWrapper = document.createElement("div");
        this.container.appendChild(this.contentWrapper);

        this.homeSection = document.createElement("div");
        this.buildModules();
        this.buildStates();

        this.contentWrapper.appendChild(this.homeSection);
    }

    buildModules() {
        var title = document.createElement("h3");
        title.textContent = "Módulos";
        this.homeSection.appendChild(title);

        var row = document.createElement("div");
        row.className = "w3-row-padding";
        row.style.margin = "0 -16px";

        for (var i = 0; i < MENU.length; i++) {
            var option = MENU[i];
            if (option.href === "#inicio") continue;

            var column = document.createElement("div");
            column.className = "w3-col l3 m6 s12 w3-margin-bottom";

            var card = document.createElement("div");
            card.className = "w3-card w3-white w3-padding modulo-card";
            card.style.minHeight = "190px";

            var name = document.createElement("h4");
            name.textContent = option.text;
            card.appendChild(name);

            var description = document.createElement("p");
            description.className = "w3-text-grey";
            description.textContent = option.description;
            card.appendChild(description);

            if (option.enabled) {
                card.className += " modulo-activo";

                var link = document.createElement("a");
                link.href = option.href;
                link.className = "w3-button w3-teal w3-round";
                link.textContent = "Ir a " + option.text;
                card.appendChild(link);
            } else {
                var tag = document.createElement("span");
                tag.className = "w3-tag w3-light-grey w3-round";
                tag.textContent = "Próximamente";
                card.appendChild(tag);
            }

            column.appendChild(card);
            row.appendChild(column);
        }

        this.homeSection.appendChild(row);
    }

    buildStates() {
        var title = document.createElement("h3");
        title.textContent = "Estado de los recursos ahora";
        this.homeSection.appendChild(title);

        this.message = document.createElement("p");
        this.message.className = "w3-text-grey";
        this.message.textContent = "Cargando estado de los recursos...";
        this.homeSection.appendChild(this.message);

        this.tableWrapper = document.createElement("div");
        this.homeSection.appendChild(this.tableWrapper);
    }

    connectedCallback() {
    }

    disconnectedCallback() {
        this.controller.stop();
    }

    show() {
        this.style.display = "block";
    }

    hide() {
        this.style.display = "none";
    }

    showHome() {
        this.contentWrapper.replaceChildren(this.homeSection);
    }

    loadView(tagName) {
        this.contentWrapper.replaceChildren();
        var element = document.createElement(tagName);
        this.contentWrapper.appendChild(element);
    }

    showMessage(text, isError) {
        this.message.textContent = text;
        this.message.className = isError ? "w3-text-red" : "w3-text-grey";
    }

    clearTable() {
        this.tableWrapper.replaceChildren();
    }

    renderStates(states) {
        this.clearTable();

        var hasError = false;
        for (var e = 0; e < states.length; e++) {
            if (states[e].status === "error") hasError = true;
        }

        if (hasError) {
            this.showMessage("No se pudo conectar con el servidor.", true);
        } else {
            var time = new Date().toTimeString().slice(0, 8);
            this.showMessage("Actualizado a las " + time + " (se renueva solo).", false);
        }

        var table = document.createElement("table");
        table.className = "w3-table w3-white w3-card w3-striped";

        var thead = document.createElement("thead");
        var trHead = document.createElement("tr");
        trHead.className = "w3-teal";

        var headers = ["Recurso", "Ahora", "Reservado por", "Bloques reservados hoy"];
        for (var h = 0; h < headers.length; h++) {
            var th = document.createElement("th");
            th.textContent = headers[h];
            if (h === 1 || h === 3) th.className = "w3-center";
            trHead.appendChild(th);
        }
        thead.appendChild(trHead);
        table.appendChild(thead);

        var tbody = document.createElement("tbody");

        for (var i = 0; i < states.length; i++) {
            var item = states[i];
            var row = document.createElement("tr");

            var tdResource = document.createElement("td");
            tdResource.textContent = item.resource.toUpperCase();
            row.appendChild(tdResource);

            var tdStatus = document.createElement("td");
            tdStatus.className = "w3-center w3-text-white";
            if (item.status === "occupied") {
                tdStatus.textContent = "Ocupado";
                tdStatus.className += " w3-orange";
            } else if (item.status === "free") {
                tdStatus.textContent = "Libre";
                tdStatus.className += " w3-green";
            } else if (item.status === "closed") {
                tdStatus.textContent = "Fuera de horario";
                tdStatus.className += " w3-grey";
            } else {
                tdStatus.textContent = "Sin conexión";
                tdStatus.className += " w3-grey";
            }
            row.appendChild(tdStatus);

            var tdTeacher = document.createElement("td");
            tdTeacher.textContent = item.teacher || "—";
            row.appendChild(tdTeacher);

            var tdBlocks = document.createElement("td");
            tdBlocks.className = "w3-center";
            tdBlocks.textContent = item.status === "error" ? "—" : item.todayBlocks;
            row.appendChild(tdBlocks);

            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        this.tableWrapper.appendChild(table);
    }
}

customElements.define("wc-dashboard-view", WCDashboardView);

export { WCDashboardView };
