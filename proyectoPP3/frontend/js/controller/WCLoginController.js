class WCLoginController {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }

    start() {
        this.view.hide();
    }

    handleSubmit(event) {
        var self = this;

        if (event) event.preventDefault();

        var credentials = this.view.getCredentials();

        if (!credentials.username || !credentials.password) {
            this.view.showError("Ingresá usuario y contraseña.");
            return;
        }

        this.view.setLoading(true);
        this.view.clearMessage();

        this.model.authenticate(credentials.username, credentials.password)
        .then(function (result) {
            if (!result.ok || result.data.status !== true) {
                self.view.setLoading(false);
                self.view.showError("Usuario o contraseña incorrectos.");
                return;
            }

            self.model.saveSession(result.data.result);
            self.view.setLoading(false);
            self.view.hide();

            window.location.hash = "#inicio";
            window.location.reload();
        })
        .catch(function (error) {
            console.error("Login error:", error);
            self.view.setLoading(false);
            self.view.showError("No se pudo conectar con el servidor.");
        });
    }

    handleLogout() {
        this.model.logout();
        window.location.hash = "";
        window.location.reload();
    }
}

export { WCLoginController };
