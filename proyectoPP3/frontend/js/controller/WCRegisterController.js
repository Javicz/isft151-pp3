class WCRegisterController {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }

    handleSubmit(event) {
        var self = this;

        if (event) event.preventDefault();

        var credentials = this.view.getCredentials();

        if (!credentials.username || !credentials.password) {
            this.view.showError("Ingresá usuario y contraseña.");
            return;
        }

        if (credentials.username.length < 3) {
            this.view.showError("El usuario debe tener al menos 3 caracteres.");
            return;
        }

        if (credentials.password.length < 4) {
            this.view.showError("La contraseña debe tener al menos 4 caracteres.");
            return;
        }

        if (credentials.password !== credentials.passwordRepeat) {
            this.view.showError("Las contraseñas no coinciden.");
            return;
        }

        this.view.setLoading(true);

        this.model.register(credentials.username, credentials.password)
        .then(function (result) {
            self.view.setLoading(false);

            if (!result.ok || result.data.status !== "ok") {
                self.view.showError("Error al registrar: " + (result.data.message || "Error desconocido"));
                return;
            }

            self.view.showSuccess("Cuenta creada. Ahora iniciá sesión.");
            setTimeout(function () {
                window.location.hash = "#login";
            }, 1200);
        })
        .catch(function (error) {
            console.error("Register error:", error);
            self.view.setLoading(false);
            self.view.showError("No se pudo conectar con el servidor.");
        });
    }
}

export { WCRegisterController };
