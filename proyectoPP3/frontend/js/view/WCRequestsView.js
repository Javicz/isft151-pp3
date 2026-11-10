import { attachViewShadow } from '../shadow.js';

class WCRequestsView extends HTMLElement {
    constructor() {
        super();
        this.root = attachViewShadow(this);

        this.container = document.createElement("div");
        this.container.className = "w3-container w3-padding-32";

        this.h1 = document.createElement("h1");
        this.h1.textContent = "Pedidos";

        this.message = document.createElement("p");
        this.message.className = "w3-text-grey w3-padding-16";
        this.message.textContent = "El módulo de pedidos estará disponible próximamente.";

        this.container.appendChild(this.h1);
        this.container.appendChild(this.message);

        this.root.appendChild(this.container);
    }

    connectedCallback() {
    }

    disconnectedCallback() {
    }
}

customElements.define("wc-requests-view", WCRequestsView);

export { WCRequestsView };
