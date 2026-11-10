class WCInventoryModel extends EventTarget {
    constructor() {
        super();
        this.resources = [];
    }

    setResources(resources) {
        this.resources = Array.isArray(resources) ? resources : [];
        this.dispatchEvent(new CustomEvent("resources-changed"));
    }

    getResources() {
        return this.resources;
    }

    pad(number) {
        return String(number).padStart(2, '0');
    }

    today() {
        var date = new Date();
        return date.getFullYear() + '-' +
            this.pad(date.getMonth() + 1) + '-' +
            this.pad(date.getDate());
    }
}

export { WCInventoryModel };
