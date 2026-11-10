import { GRID_START_HOUR, GRID_END_HOUR, DEFAULT_INTERVAL_DURATION } from '../config.js';

class WCAvailabilityModel extends EventTarget {
    constructor() {
        super();
        this.resource = "computadora";
        this.day = this.today();
        this.startTime = "08:00";
        this.endTime = "23:59";
        this.intervalDuration = DEFAULT_INTERVAL_DURATION;
        this.blocks = [];
        this.selection = [];
        this.selectionComplete = false;
        this.occupiedZone = [];
    }

    setResource(resource) { this.resource = resource; }
    setDay(day) { this.day = day; }
    setRange(startTime, endTime) { this.startTime = startTime; this.endTime = endTime; }

    pad(num) {
        return String(num).padStart(2, '0');
    }

    today() {
        var d = new Date();
        return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate());
    }

    formatDateTime(date) {
        var formattedDate =
            date.getFullYear() + '-' +
            this.pad(date.getMonth() + 1) + '-' +
            this.pad(date.getDate());
        var formattedTime =
            this.pad(date.getHours()) + ':' +
            this.pad(date.getMinutes());
        return formattedDate + ' ' + formattedTime;
    }

    currentBlockStart() {
        var now = new Date();
        now.setMinutes(now.getMinutes() - (now.getMinutes() % this.intervalDuration));
        return this.formatDateTime(now);
    }

    generateGrid() {
        this.blocks = [];
        var startHour = GRID_START_HOUR;
        var endHour = GRID_END_HOUR;
        var minutesPerBlock = this.intervalDuration;

        var startHourStr = this.pad(startHour);
        var baseDate = new Date(this.day + 'T' + startHourStr + ':00:00');
        var totalBlocks = (endHour - startHour) * (60 / minutesPerBlock);
        var limit = this.currentBlockStart();

        for (var i = 0; i < totalBlocks; i++) {
            var start = new Date(baseDate);
            start.setMinutes(start.getMinutes() + i * minutesPerBlock);

            var dateTime = this.formatDateTime(start);

            this.blocks.push({
                dateTime: dateTime,
                occupied: false,
                teacher: null,
                past: dateTime < limit
            });
        }
    }

    setOccupiedZone(occupiedZone) {
        this.occupiedZone = Array.isArray(occupiedZone) ? occupiedZone : [];
    }

    crossOccupied() {
        var occupiedMap = new Map();
        for (var i = 0; i < this.occupiedZone.length; i++) {
            occupiedMap.set(this.occupiedZone[i].dateTime, this.occupiedZone[i]);
        }

        for (var j = 0; j < this.blocks.length; j++) {
            var block = this.blocks[j];
            if (occupiedMap.has(block.dateTime)) {
                var occupied = occupiedMap.get(block.dateTime);
                block.occupied = true;
                block.teacher = occupied.teacher || null;
            } else {
                block.occupied = false;
                block.teacher = null;
            }
        }
    }

    visibleBlocks() {
        var from = this.startTime;
        var to = this.endTime;
        return this.blocks.filter(function (block) {
            var time = block.dateTime.split(' ')[1];
            return time >= from && time < to;
        });
    }

    toggleSelection(dateTime) {
        var index = this.selection.indexOf(dateTime);
        if (index === -1) {
            this.selection.push(dateTime);
        } else {
            this.selection.splice(index, 1);
        }
    }

    selectBlock(dateTime) {
        if (this.selection.length === 0 || this.selectionComplete) {
            this.selection = [dateTime];
            this.selectionComplete = false;
            return "start";
        }

        var from = this.selection[0];
        if (dateTime < from) return "before";

        this.selection = this.blocks
            .filter(function (block) { return block.dateTime >= from && block.dateTime <= dateTime; })
            .map(function (block) { return block.dateTime; });
        this.selectionComplete = true;
        return "end";
    }

    selectionOwnedBy(name) {
        var self = this;
        return this.selection.every(function (dateTime) {
            var block = self.findBlock(dateTime);
            return block !== null && block.teacher === name;
        });
    }

    clearSelection() {
        this.selection = [];
        this.selectionComplete = false;
        this.dispatchEvent(new CustomEvent("selection-cleared"));
    }

    selectedRange() {
        if (this.selection.length === 0) return null;

        var times = this.selection.map(function (dateTime) {
            return dateTime.split(' ')[1];
        });
        times.sort();

        var from = times[0];
        var last = times[times.length - 1];

        var parts = last.split(':');
        var hour = parseInt(parts[0], 10);
        var minute = parseInt(parts[1], 10) + this.intervalDuration;
        if (minute >= 60) { hour = hour + Math.floor(minute / 60); minute = minute % 60; }
        var to = this.pad(hour) + ':' + this.pad(minute);

        return { startTime: from, endTime: to };
    }

    selectionType() {
        if (this.selection.length === 0) return "empty";

        var hasFree = false;
        var hasOccupied = false;

        for (var i = 0; i < this.selection.length; i++) {
            var block = this.findBlock(this.selection[i]);
            if (!block) continue;

            if (block.occupied === true) {
                hasOccupied = true;
            } else {
                hasFree = true;
            }
        }

        if (hasFree && hasOccupied) return "mixed";
        if (hasOccupied) return "occupied";
        return "free";
    }

    findBlock(dateTime) {
        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].dateTime === dateTime) {
                return this.blocks[i];
            }
        }
        return null;
    }

    checkAvailability(startTime, endTime) {
        for (var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];
            var time = block.dateTime.split(' ')[1];

            if (time >= startTime && time < endTime && block.occupied === true) {
                return {
                    available: false,
                    reason: 'El recurso ya está ocupado en ese horario',
                    conflict: block
                };
            }
        }

        return { available: true, reason: 'El recurso está disponible' };
    }

    applyReservation(startTime, endTime, teacher) {
        for (var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];
            var time = block.dateTime.split(' ')[1];

            if (time >= startTime && time < endTime) {
                block.occupied = true;
                block.teacher = teacher || null;
            }
        }
    }

    releaseBlock(dateTime) {
        var block = this.findBlock(dateTime);

        if (block && block.occupied === true) {
            block.occupied = false;
            block.teacher = null;
        }
    }

    releaseSelection() {
        for (var i = 0; i < this.selection.length; i++) {
            this.releaseBlock(this.selection[i]);
        }
    }

    occupiedOfDay() {
        var occupied = [];

        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].occupied === true) {
                occupied.push(this.blocks[i]);
            }
        }

        return occupied;
    }

    mergeBlocks(oldBlocks, newBlocks) {
        var map = new Map();

        for (var i = 0; i < oldBlocks.length; i++) {
            map.set(oldBlocks[i].dateTime, oldBlocks[i]);
        }

        for (var j = 0; j < newBlocks.length; j++) {
            map.set(newBlocks[j].dateTime, newBlocks[j]);
        }

        var merged = [];
        map.forEach(function (block) {
            merged.push(block);
        });

        merged.sort(function (a, b) {
            return a.dateTime < b.dateTime ? -1 : 1;
        });

        return merged;
    }

    finalStateToSave() {
        var otherDays = [];

        for (var i = 0; i < this.occupiedZone.length; i++) {
            var block = this.occupiedZone[i];
            var blockDay = block.dateTime.split(' ')[0];

            if (blockDay !== this.day) {
                otherDays.push(block);
            }
        }

        return this.mergeBlocks(otherDays, this.occupiedOfDay());
    }
}

export { WCAvailabilityModel };
