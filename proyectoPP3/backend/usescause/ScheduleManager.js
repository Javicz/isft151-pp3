import { getResourceById } from '../repositories/resourceRepository.js';

class BusinessError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status || 400;
    }
}

class ScheduleManager {
    constructor() {
        this.START_HOUR = 6;
        this.END_HOUR = 24;
        this.MINUTES_PER_BLOCK = 30;
    }

    pad(num) {
        return String(num).padStart(2, '0');
    }

    formatDateTime(date) {
        const formattedDate =
            date.getFullYear() + '-' +
            this.pad(date.getMonth() + 1) + '-' +
            this.pad(date.getDate());
        const formattedTime =
            this.pad(date.getHours()) + ':' +
            this.pad(date.getMinutes());
        return formattedDate + ' ' + formattedTime;
    }

    generateTimeBlocks(day) {
        const blocks = [];
        const startHourStr = this.pad(this.START_HOUR);
        const dateStr = day + 'T' + startHourStr + ':00:00';
        const baseDate = new Date(dateStr);
        const totalBlocks = (this.END_HOUR - this.START_HOUR) * (60 / this.MINUTES_PER_BLOCK);

        for (let i = 0; i < totalBlocks; i++) {
            const start = new Date(baseDate);
            const minutesToAdd = i * this.MINUTES_PER_BLOCK;
            const baseMinutes = start.getMinutes();
            start.setMinutes(baseMinutes + minutesToAdd);

            blocks.push({
                dateTime: this.formatDateTime(start),
                occupied: false,
                teacher: null
            });
        }
        return blocks;
    }

    applyReservation(dayBlocks, startTime, endTime, teacher) {
        for (let i = 0; i < dayBlocks.length; i++) {
            const block = dayBlocks[i];
            const blockTime = block.dateTime.split(' ')[1];
            if (blockTime >= startTime && blockTime < endTime) {
                block.occupied = true;
                block.teacher = teacher || null;
            }
        }
        return dayBlocks;
    }

    mergeBlocks(oldBlocks, newBlocks) {
        const map = new Map();

        for (let i = 0; i < oldBlocks.length; i++) {
            map.set(oldBlocks[i].dateTime, oldBlocks[i]);
        }
        for (let j = 0; j < newBlocks.length; j++) {
            map.set(newBlocks[j].dateTime, newBlocks[j]);
        }

        const merged = [];
        map.forEach(function (block) {
            merged.push(block);
        });
        return merged;
    }

    buildNewBlocks(dateTimes, teacher) {
        const grids = new Map();
        const self = this;

        dateTimes.forEach(function (dateTime) {
            const parts = dateTime.split(' ');
            const day = parts[0];
            const time = parts[1];

            if (!grids.has(day)) {
                grids.set(day, self.generateTimeBlocks(day));
            }

            const timeParts = time.split(':');
            const endMinutes = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10) + self.MINUTES_PER_BLOCK;
            const endTime = self.pad(Math.floor(endMinutes / 60)) + ':' + self.pad(endMinutes % 60);

            self.applyReservation(grids.get(day), time, endTime, teacher);
        });

        const reserved = [];
        grids.forEach(function (grid) {
            grid.forEach(function (block) {
                if (block.occupied === true) reserved.push(block);
            });
        });
        return reserved;
    }

    currentBlockStart(now) {
        const date = new Date(now || Date.now());
        date.setMinutes(date.getMinutes() - (date.getMinutes() % this.MINUTES_PER_BLOCK));
        return this.formatDateTime(date);
    }

    isPastBlock(dateTime, now) {
        return dateTime < this.currentBlockStart(now);
    }

    hasPastBlock(blocks, now) {
        const limit = this.currentBlockStart(now);
        return blocks.some(function (block) {
            return block.dateTime < limit;
        });
    }

    isValidResource(resource) {
        return typeof resource === 'string' && !!getResourceById(resource);
    }

    isValidDateTime(dateTime) {
        if (typeof dateTime !== 'string') return false;

        const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(dateTime);
        if (!m) return false;

        const month = parseInt(m[2], 10);
        const day = parseInt(m[3], 10);
        const hour = parseInt(m[4], 10);
        const minute = parseInt(m[5], 10);

        const date = new Date(Date.UTC(parseInt(m[1], 10), month - 1, day));
        if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return false;

        if (hour < this.START_HOUR || hour >= this.END_HOUR) return false;
        return minute < 60 && minute % this.MINUTES_PER_BLOCK === 0;
    }

    normalizeBlocks(dateTimes) {
        if (!Array.isArray(dateTimes) || dateTimes.length === 0) {
            throw new BusinessError('Tenés que indicar al menos un bloque', 400);
        }

        const unique = [];
        for (let i = 0; i < dateTimes.length; i++) {
            if (!this.isValidDateTime(dateTimes[i])) {
                throw new BusinessError('Bloque inválido: ' + dateTimes[i], 400);
            }
            if (unique.indexOf(dateTimes[i]) === -1) {
                unique.push(dateTimes[i]);
            }
        }
        return unique;
    }

    checkAvailability(savedBlocks, dateTimes) {
        for (let i = 0; i < savedBlocks.length; i++) {
            const saved = savedBlocks[i];
            if (saved.occupied === true && dateTimes.indexOf(saved.dateTime) !== -1) {
                return {
                    available: false,
                    reason: 'El recurso ya está ocupado el ' + saved.dateTime +
                            (saved.teacher ? ' (' + saved.teacher + ')' : ''),
                    conflict: saved
                };
            }
        }
        return { available: true, reason: 'El recurso está disponible' };
    }

    reserve(savedBlocks, dateTimes, teacher) {
        const verification = this.checkAvailability(savedBlocks, dateTimes);
        if (!verification.available) {
            throw new BusinessError(verification.reason, 409);
        }

        const newBlocks = dateTimes.map(function (dateTime) {
            return { dateTime: dateTime, occupied: true, teacher: teacher };
        });

        return savedBlocks
            .concat(newBlocks)
            .sort(function (a, b) { return a.dateTime < b.dateTime ? -1 : 1; });
    }

    release(savedBlocks, dateTimes) {
        const remaining = savedBlocks.filter(function (block) {
            return dateTimes.indexOf(block.dateTime) === -1;
        });
        return {
            blocks: remaining,
            released: savedBlocks.length - remaining.length
        };
    }

    buildRawResponse(savedBlocks, startTime, endTime, day) {
        const occupiedZone = savedBlocks
            .filter(function (block) {
                if (block.occupied !== true) return false;
                return !day || block.dateTime.split(' ')[0] === day;
            })
            .map(function (block) {
                return {
                    dateTime: block.dateTime,
                    occupied: true,
                    teacher: block.teacher || null
                };
            });

        return {
            startTime: startTime,
            endTime: endTime,
            intervalDuration: this.MINUTES_PER_BLOCK,
            occupiedZone: occupiedZone
        };
    }
}

export { ScheduleManager, BusinessError };
