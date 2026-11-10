import { APP_NAME } from '../config.js';
import { WCLoginModel } from '../model/WCLoginModel.js';
import { WCLoginController } from '../controller/WCLoginController.js';
import { attachViewShadow } from '../shadow.js';

class WCLoginView extends HTMLElement {
    constructor() {
        super();
        this.root = attachViewShadow(this);

        this.container = document.createElement("div");
        this.container.className = "w3-container w3-padding-32";

        this.wrapper = document.createElement("div");
        this.wrapper.className = "w3-auto";
        this.wrapper.style.maxWidth = "420px";

        this.card = document.createElement("div");
        this.card.className = "w3-card w3-white w3-round w3-border w3-margin-bottom";

        this.cardHeader = document.createElement("div");
        this.cardHeader.className = "w3-container w3-teal w3-padding-24 w3-center";

        this.heading = document.createElement("h1");
        this.heading.className = "w3-margin-0";
        this.heading.textContent = "Iniciar sesión";

        this.subtitle = document.createElement("p");
        this.subtitle.className = "w3-opacity";
        this.subtitle.textContent = APP_NAME;

        this.cardHeader.appendChild(this.heading);
        this.cardHeader.appendChild(this.subtitle);

        this.cardBody = document.createElement("div");
        this.cardBody.className = "w3-container w3-padding-large";

        this.form = document.createElement("form");
        this.form.noValidate = true;

        this.usernameGroup = document.createElement("div");
        this.usernameGroup.className = "w3-margin-bottom";

        this.usernameLabel = document.createElement("label");
        this.usernameLabel.className = "w3-text-grey";
        this.usernameLabel.textContent = "Usuario";

        this.usernameInput = document.createElement("input");
        this.usernameInput.type = "text";
        this.usernameInput.className = "w3-input w3-border w3-round";
        this.usernameInput.placeholder = "Ingresá tu usuario";
        this.usernameInput.autocomplete = "username";

        this.usernameGroup.appendChild(this.usernameLabel);
        this.usernameGroup.appendChild(this.usernameInput);

        this.passwordGroup = document.createElement("div");
        this.passwordGroup.className = "w3-margin-bottom";

        this.passwordLabel = document.createElement("label");
        this.passwordLabel.className = "w3-text-grey";
        this.passwordLabel.textContent = "Contraseña";

        this.passwordInput = document.createElement("input");
        this.passwordInput.type = "password";
        this.passwordInput.className = "w3-input w3-border w3-round";
        this.passwordInput.placeholder = "Ingresá tu contraseña";
        this.passwordInput.autocomplete = "current-password";

        this.passwordGroup.appendChild(this.passwordLabel);
        this.passwordGroup.appendChild(this.passwordInput);

        this.submitButton = document.createElement("button");
        this.submitButton.type = "submit";
        this.submitButton.className = "w3-button w3-teal w3-round w3-block w3-margin-top";
        this.submitButton.textContent = "Ingresar";

        this.message = document.createElement("p");
        this.message.className = "w3-center w3-text-red w3-margin-top";
        this.message.textContent = "";

        this.form.appendChild(this.usernameGroup);
        this.form.appendChild(this.passwordGroup);
        this.form.appendChild(this.submitButton);
        this.form.appendChild(this.message);

        this.links = document.createElement("p");
        this.links.className = "w3-center w3-small";

        this.registerLink = document.createElement("a");
        this.registerLink.href = "#registro";
        this.registerLink.textContent = "¿No tenés cuenta? Registrate como profesor";

        this.homeLink = document.createElement("a");
        this.homeLink.href = "#inicio";
        this.homeLink.textContent = "Volver al inicio";

        this.links.appendChild(this.registerLink);
        this.links.appendChild(document.createElement("br"));
        this.links.appendChild(this.homeLink);

        this.cardBody.appendChild(this.form);
        this.cardBody.appendChild(this.links);
        this.card.appendChild(this.cardHeader);
        this.card.appendChild(this.cardBody);
        this.wrapper.appendChild(this.card);
        this.container.appendChild(this.wrapper);

        this.root.appendChild(this.container);

        this.model = new WCLoginModel();
        this.controller = new WCLoginController(this, this.model);
        this.controller.start();
    }

    connectedCallback() {
        this.form.onsubmit = this.controller.handleSubmit.bind(this.controller);
    }

    disconnectedCallback() {
        this.form.onsubmit = null;
    }

    getCredentials() {
        return {
            username: this.usernameInput.value.trim(),
            password: this.passwordInput.value
        };
    }

    setLoading(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.textContent = isLoading ? "Ingresando..." : "Ingresar";
    }

    clearMessage() {
        this.message.textContent = "";
        this.message.className = "w3-center w3-text-red w3-margin-top";
    }

    showError(text) {
        this.message.textContent = text;
        this.message.className = "w3-center w3-text-red w3-margin-top";
    }

    show() {
        this.style.display = "block";
    }

    hide() {
        this.style.display = "none";
    }
}

customElements.define("wc-login-view", WCLoginView);

export { WCLoginView };
