import { GRID_START_HOUR } from '../config.js';

class WCDashboardModel extends EventTarget {
    constructor() {
        super();
        this.states = [];
    }

    pad(num) {
        return String(num).padStart(2, '0');
    }

    today() {
        var d = new Date();
        return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate());
    }

    currentBlock() {
        var d = new Date();
        if (d.getHours() < GRID_START_HOUR) return null;

        var minutes = d.getMinutes() < 30 ? 0 : 30;
        return this.today() + ' ' + this.pad(d.getHours()) + ':' + this.pad(minutes);
    }

    calculateState(resource, occupiedZone) {
        var now = this.currentBlock();
        var occupiedBlock = null;
        var today = this.today();
        var todayBlocks = [];

        for (var i = 0; i < occupiedZone.length; i++) {
            if (occupiedZone[i].dateTime.split(' ')[0] === today) {
                todayBlocks.push(occupiedZone[i]);
            }
        }

        for (var j = 0; j < todayBlocks.length; j++) {
            if (todayBlocks[j].dateTime === now) {
                occupiedBlock = todayBlocks[j];
            }
        }

        var status = "free";
        if (now === null) status = "closed";
        else if (occupiedBlock) status = "occupied";

        return {
            resource: resource,
            status: status,
            teacher: occupiedBlock ? occupiedBlock.teacher : null,
            todayBlocks: todayBlocks.length
        };
    }

    disconnectedState(resource) {
        return { resource: resource, status: "error", teacher: null, todayBlocks: 0 };
    }

    setStates(states) {
        this.states = states;
        this.dispatchEvent(new CustomEvent("states-changed"));
    }
}

export { WCDashboardModel };
