import { attachViewShadow } from '../shadow.js';

class WCHelpView extends HTMLElement {
    constructor() {
        super();
        this.root = attachViewShadow(this);

        this.container = document.createElement("div");
        this.container.className = "w3-container w3-padding-32";

        var title = document.createElement("h1");
        title.textContent = "Ayuda";

        var subtitle = document.createElement("p");
        subtitle.className = "w3-text-grey";
        subtitle.textContent = "Preguntas frecuentes sobre las reservas.";

        var faqTitle = document.createElement("h2");
        faqTitle.textContent = "Preguntas frecuentes";

        this.container.appendChild(title);
        this.container.appendChild(subtitle);
        this.container.appendChild(faqTitle);
        this.container.appendChild(this.buildIntro());
        this.container.appendChild(this.buildFaqs());
        this.container.appendChild(this.buildClosing());

        this.root.appendChild(this.container);
    }

    
    buildIntro() {
        var panel = document.createElement("div");        
        return panel;
    }


    buildFaqs() {
        var wrapper = document.createElement("div");

        wrapper.appendChild(this.buildFaq("¿Cómo hago una reserva?", [
            this.paragraph("Los pasos son estos:"),
            this.list([
                "Entrá con tu cuenta. Si todavía no tenés una, creala desde Registrarse.",
                "Andá a la opción Disponibilidad del menú.",
                "Elegí el recurso, el día y el rango de horas que querés consultar.",
                "Tocá Verificar disponibilidad para ver los bloques.",
                "Hacé clic en el primer bloque libre y después en el último. Si querés un solo bloque, alcanza con un clic.",
                "Revisá que la selección sea la correcta y tocá Aplicar reserva.",
                "Confirmá el nombre del docente y listo."
            ], true)
        ]));

        wrapper.appendChild(this.buildFaq("¿Qué necesito para poder reservar?", [
            this.list([
                "Tener una cuenta registrada en el sistema.",
                "Haber iniciado sesión antes de reservar.",
                "Que tu cuenta sea de profesor. Cuando te registrás, la cuenta queda con ese rol.",
                "Que el recurso exista en el inventario.",
                "Elegir bloques futuros, dentro del horario de la escuela."
            ])
        ]));

        wrapper.appendChild(this.buildFaq("¿Qué cosas puedo hacer?", [
            this.list([
                "Reservar uno o varios bloques libres de un mismo recurso.",
                "Reservar con anticipación, siempre que el horario sea futuro.",
                "Consultar la disponibilidad sin iniciar sesión.",
                "Cancelar mis propias reservas.",
                "Ver quién tiene ocupado un bloque.",
                "Si sos administrador, reservar a nombre de otro docente y cancelar reservas de cualquier usuario."
            ])
        ]));

        wrapper.appendChild(this.buildFaq("¿Qué cosas no puedo hacer?", [
            this.list([
                "Reservar un bloque que ya está ocupado.",
                "Reservar en un horario que ya pasó.",
                "Reservar fuera del horario de 06:00 a 24:00.",
                "Mezclar bloques libres con bloques ocupados en una misma selección.",
                "Cancelar la reserva de otro docente, salvo que seas administrador.",
                "Reservar sin haber iniciado sesión.",
                "Dejar vacío el nombre del docente cuando el sistema lo pide."
            ])
        ]));

        wrapper.appendChild(this.buildFaq("¿Cómo cancelo una reserva?", [
            this.paragraph("Entrá a Disponibilidad, buscá el día y el recurso, y seleccioná los bloques ocupados " +
                "que sean tuyos. Después tocá Liberar selección y confirmá."),
            this.paragraph("Solo podés cancelar reservas propias y de horarios que todavía no pasaron. " +
                "Si la reserva es de otra persona, el sistema no te va a dejar.")
        ]));

        wrapper.appendChild(this.buildFaq("¿Qué significa cada estado de la tabla?", [
            this.list([
                "Libre: el bloque se puede reservar.",
                "Ocupado: ya tiene una reserva y muestra el nombre del docente.",
                "Pasado: el horario ya pasó y no se puede reservar ni liberar.",
                "Seleccionado: es el bloque que elegiste para reservar o liberar."
            ])
        ]));

        wrapper.appendChild(this.buildFaq("¿Por qué no me deja reservar?", [
            this.paragraph("Fijate si pasa alguna de estas cosas:"),
            this.list([
                "No iniciaste sesión.",
                "El bloque ya está ocupado.",
                "El horario elegido ya pasó.",
                "La selección mezcla bloques libres y ocupados.",
                "El recurso no existe o no está cargado.",
                "El nombre del docente quedó vacío."
            ])
        ]));

        return wrapper;
    }

    buildClosing() {
        var panel = document.createElement("div");
        return panel;
    }

    buildFaq(question, elements) {
        var item = document.createElement("details");
        item.className = "w3-card w3-white w3-round w3-margin-bottom w3-padding";

        var summary = document.createElement("summary");
        summary.textContent = question;
        summary.style.cursor = "pointer";
        summary.style.fontWeight = "bold";

        var body = document.createElement("div");
        body.className = "w3-padding-16";

        for (var i = 0; i < elements.length; i++) {
            body.appendChild(elements[i]);
        }

        item.appendChild(summary);
        item.appendChild(body);
        return item;
    }

    paragraph(text) {
        var p = document.createElement("p");
        p.textContent = text;
        return p;
    }

    list(items, ordered) {
        var list = document.createElement(ordered ? "ol" : "ul");

        for (var i = 0; i < items.length; i++) {
            var li = document.createElement("li");
            li.textContent = items[i];
            list.appendChild(li);
        }

        return list;
    }
}

customElements.define("wc-help-view", WCHelpView);

export { WCHelpView };
