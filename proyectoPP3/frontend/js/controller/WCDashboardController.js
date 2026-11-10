import { ENDPOINTS, RESOURCES, STATUS_REFRESH_MS } from '../config.js';
import { callRpc } from '../api.js';
import { getSession } from '../session.js';
import { loadResources } from '../resources.js';

class WCDashboardController {
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.timer = null;
        this._boundLoadStates = this.loadStates.bind(this);
        this._boundHashChange = this.onHashChange.bind(this);
    }

    start() {
        this.handleHashChange();
        this.loadStates();

        this.timer = setInterval(this._boundLoadStates, STATUS_REFRESH_MS);
        window.addEventListener("hashchange", this._boundHashChange);
    }

    stop() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
        window.removeEventListener("hashchange", this._boundHashChange);
    }

    navigate(href) {
        if (window.location.hash === href) {
            this.handleHashChange();
            return;
        }
        window.location.hash = href;
    }

    onHashChange() {
        this.handleHashChange();

        var hash = window.location.hash;
        var isHome = hash !== "#inventario" && hash !== "#disponibilidad" &&
                       hash !== "#ayuda" && hash !== "#login" && hash !== "#registro";
        if (isHome) this.loadStates();
    }

    showAuthScreen(hash) {
        var login = document.querySelector("wc-login-view");
        var register = document.querySelector("wc-register-view");

        this.view.hide();
        if (login) login.style.display = hash === "#login" ? "block" : "none";
        if (register) register.style.display = hash === "#registro" ? "block" : "none";
    }

    hideAuthScreens() {
        var login = document.querySelector("wc-login-view");
        var register = document.querySelector("wc-register-view");

        if (login) login.style.display = "none";
        if (register) register.style.display = "none";
        this.view.show();
    }

    handleHashChange() {
        var hash = window.location.hash;

        if (hash === "#login" || hash === "#registro") {
            if (getSession()) {
                window.location.hash = "#inicio";
                return;
            }
            this.showAuthScreen(hash);
            return;
        }

        this.hideAuthScreens();

        if (hash === "#inventario") {
            this.view.loadView("wc-inventory-view");
            return;
        }

        if (hash === "#disponibilidad") {
            this.view.loadView("wc-availability-view");
            return;
        }

        if (hash === "#ayuda") {
            this.view.loadView("wc-help-view");
            return;
        }

        this.view.showHome();
    }

    loadStates() {
        var self = this;

        loadResources().then(function () {
            self.loadStatesNow();
        });
    }

    loadStatesNow() {
        var self = this;
        var model = this.model;
        var day = model.today();

        var requests = RESOURCES.map(function (resource) {
            var data = {
                resource: resource,
                day: day,
                startTime: "06:00",
                endTime: "23:59"
            };

            return callRpc(ENDPOINTS.getAvailability, data)
            .then(function (response) {
                if (response.status !== "success") {
                    return model.disconnectedState(resource);
                }
                return model.calculateState(resource, response.data.occupiedZone || []);
            })
            .catch(function (error) {
                console.error("Fetch error (" + resource + "):", error);
                return model.disconnectedState(resource);
            });
        });

        Promise.all(requests).then(function (states) {
            model.setStates(states);
            self.view.renderStates(states);
        });
    }
}

export { WCDashboardController };
