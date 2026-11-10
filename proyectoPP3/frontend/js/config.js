export const API_URL = "http://127.0.0.1:3000";

export const ENDPOINTS = {
    login: "/login",
    getAvailability: "/api/getAvailability",
    applyReservation: "/api/applyReservation",
    releaseReservation: "/api/reservations/cancel",
    inventory: "/api/inventory/list",
    createResource: "/api/resources/create",
    deleteResource: "/api/resources/delete"
};

export const RESOURCES = ["computadora", "teclado", "impresora", "proyector"];

export const GRID_START_HOUR = 6;
export const GRID_END_HOUR = 24;
export const DEFAULT_INTERVAL_DURATION = 30;

export const APP_NAME = "Gestión de Recursos Escolares";

export const STATUS_REFRESH_MS = 30000;

export const MENU = [
    { text: "Inicio", href: "#inicio", enabled: true, description: "" },
    { text: "Disponibilidad", href: "#disponibilidad", enabled: true, description: "Calendario por recurso: ver qué está libre y reservar." },
    { text: "Inventario", href: "#inventario", enabled: true, description: "Recursos cargados y su estado operativo." },
    { text: "Ayuda", href: "#ayuda", enabled: true, description: "Preguntas frecuentes para realizar una reserva." },
    { text: "Mantenimiento", href: "#mantenimiento", enabled: false, description: "Reporte de fallas e historial de reparaciones." }
];
