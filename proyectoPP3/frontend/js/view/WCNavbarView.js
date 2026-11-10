import { APP_NAME, MENU } from '../config.js';
import { getSession, closeSession } from '../session.js';
import { attachViewShadow } from '../shadow.js';

class WCNavbarView extends HTMLElement {
    constructor() {
        super();
        this.root = attachViewShadow(this);

        this.barWrapper = document.createElement("div");
        this.root.appendChild(this.barWrapper);

        this._boundRender = this.render.bind(this);
        this.render();
    }

    connectedCallback() {
        window.addEventListener("session-change", this._boundRender);
        window.addEventListener("hashchange", this._boundRender);
    }

    disconnectedCallback() {
        window.removeEventListener("session-change", this._boundRender);
        window.removeEventListener("hashchange", this._boundRender);
    }

    render() {
        var session = getSession();
        var bar = document.createElement("div");
        bar.className = "w3-bar w3-teal";

        var brand = document.createElement("a");
        brand.href = "#inicio";
        brand.className = "w3-bar-item w3-button w3-hover-white";
        brand.style.display = "flex";
        brand.style.alignItems = "center";
        brand.style.gap = "8px";

        var logo = document.createElement("img");
        logo.src = "image/logo.png";
        logo.alt = "ISFT 151";
        logo.style.width = "32px";
        logo.style.height = "32px";
        logo.style.borderRadius = "50%";
        logo.style.objectFit = "cover";
        brand.appendChild(logo);

        var brandName = document.createElement("span");
        brandName.textContent = APP_NAME;
        brand.appendChild(brandName);

        bar.appendChild(brand);

        var currentHash = window.location.hash;

        for (var i = 0; i < MENU.length; i++) {
            var option = MENU[i];
            var item;

            if (option.enabled) {
                item = document.createElement("a");
                item.href = option.href;
                item.className = "w3-bar-item w3-button w3-hover-white";
                if (option.href === currentHash) {
                    item.className += " w3-white w3-text-teal";
                }
            } else {
                item = document.createElement("span");
                item.className = "w3-bar-item w3-opacity";
                item.title = "Proximamente";
                item.style.cursor = "not-allowed";
            }

            item.textContent = option.text;
            bar.appendChild(item);
        }

        if (session) {
            var logout = document.createElement("button");
            logout.type = "button";
            logout.className = "w3-bar-item w3-button w3-right w3-hover-white";
            logout.textContent = "Cerrar sesión";
            logout.onclick = this.handleLogout.bind(this);
            bar.appendChild(logout);

            var user = document.createElement("span");
            user.className = "w3-bar-item w3-right";
            user.textContent = session.name + (session.role ? " (" + session.role + ")" : "");
            bar.appendChild(user);
        } else {
            var login = document.createElement("a");
            login.href = "#login";
            login.className = "w3-bar-item w3-button w3-right w3-hover-white";
            if (currentHash === "#login") login.className += " w3-white w3-text-teal";
            login.textContent = "Iniciar sesión";
            bar.appendChild(login);

            var register = document.createElement("a");
            register.href = "#registro";
            register.className = "w3-bar-item w3-button w3-right w3-hover-white";
            if (currentHash === "#registro") register.className += " w3-white w3-text-teal";
            register.textContent = "Registrarse";
            bar.appendChild(register);
        }

        this.barWrapper.replaceChildren(bar);
    }

    handleLogout() {
        closeSession();
        window.location.hash = "";
        window.location.reload();
    }
}

customElements.define("wc-navbar", WCNavbarView);

export { WCNavbarView };
