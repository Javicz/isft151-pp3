import { APP_NAME } from '../config.js';
import { WCRegisterModel } from '../model/WCRegisterModel.js';
import { WCRegisterController } from '../controller/WCRegisterController.js';
import { attachViewShadow } from '../shadow.js';

class WCRegisterView extends HTMLElement {
    constructor() {
        super();
        this.root = attachViewShadow(this);

        this.container = document.createElement("div");
        this.container.className = "w3-container w3-padding-32";

        this.wrapper = document.createElement("div");
        this.wrapper.className = "w3-auto";
        this.wrapper.style.maxWidth = "420px";

        this.card = document.createElement("div");
        this.card.className = "w3-card w3-white w3-round w3-border";

        this.cardHeader = document.createElement("div");
        this.cardHeader.className = "w3-container w3-teal w3-padding-24 w3-center";

        this.heading = document.createElement("h1");
        this.heading.className = "w3-margin-0";
        this.heading.textContent = "Registrarse";

        this.subtitle = document.createElement("p");
        this.subtitle.className = "w3-opacity";
        this.subtitle.textContent = APP_NAME;

        this.cardHeader.appendChild(this.heading);
        this.cardHeader.appendChild(this.subtitle);

        this.cardBody = document.createElement("div");
        this.cardBody.className = "w3-container w3-padding-large";

        this.form = document.createElement("form");
        this.form.noValidate = true;

        this.usernameInput = document.createElement("input");
        this.usernameInput.type = "text";
        this.usernameInput.className = "w3-input w3-border w3-round w3-margin-bottom";
        this.usernameInput.placeholder = "Usuario";
        this.usernameInput.autocomplete = "username";

        this.passwordInput = document.createElement("input");
        this.passwordInput.type = "password";
        this.passwordInput.className = "w3-input w3-border w3-round w3-margin-bottom";
        this.passwordInput.placeholder = "Contraseña";
        this.passwordInput.autocomplete = "new-password";

        this.passwordRepeatInput = document.createElement("input");
        this.passwordRepeatInput.type = "password";
        this.passwordRepeatInput.className = "w3-input w3-border w3-round w3-margin-bottom";
        this.passwordRepeatInput.placeholder = "Repetí la contraseña";
        this.passwordRepeatInput.autocomplete = "new-password";

        this.roleNote = document.createElement("p");
        this.roleNote.className = "w3-small w3-text-grey";
        this.roleNote.textContent = "El sistema lo usan docentes: la cuenta se crea con el rol de profesor. " +
            "Los roles de preceptor o directivo los asigna el administrador.";

        this.submitButton = document.createElement("button");
        this.submitButton.type = "submit";
        this.submitButton.className = "w3-button w3-teal w3-round w3-block";
        this.submitButton.textContent = "Registrarse";

        this.message = document.createElement("p");
        this.message.className = "w3-center w3-text-red w3-margin-top";

        this.form.appendChild(this.usernameInput);
        this.form.appendChild(this.passwordInput);
        this.form.appendChild(this.passwordRepeatInput);
        this.form.appendChild(this.roleNote);
        this.form.appendChild(this.submitButton);
        this.form.appendChild(this.message);

        this.links = document.createElement("p");
        this.links.className = "w3-center w3-small";

        this.loginLink = document.createElement("a");
        this.loginLink.href = "#login";
        this.loginLink.textContent = "¿Ya tenés cuenta? Iniciá sesión";

        this.homeLink = document.createElement("a");
        this.homeLink.href = "#inicio";
        this.homeLink.textContent = "Volver al inicio";

        this.links.appendChild(this.loginLink);
        this.links.appendChild(document.createElement("br"));
        this.links.appendChild(this.homeLink);

        this.cardBody.appendChild(this.form);
        this.cardBody.appendChild(this.links);
        this.card.appendChild(this.cardHeader);
        this.card.appendChild(this.cardBody);
        this.wrapper.appendChild(this.card);
        this.container.appendChild(this.wrapper);

        this.root.appendChild(this.container);

        this.model = new WCRegisterModel();
        this.controller = new WCRegisterController(this, this.model);
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
            password: this.passwordInput.value,
            passwordRepeat: this.passwordRepeatInput.value
        };
    }

    setLoading(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.textContent = isLoading ? "Registrando..." : "Registrarse";
    }

    showError(text) {
        this.message.textContent = text;
        this.message.className = "w3-center w3-text-red w3-margin-top";
    }

    showSuccess(text) {
        this.message.textContent = text;
        this.message.className = "w3-center w3-text-green w3-margin-top";
    }
}

customElements.define("wc-register-view", WCRegisterView);

export { WCRegisterView };
