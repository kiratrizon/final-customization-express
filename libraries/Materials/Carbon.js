const Configure = require("./Configure");
const { DateTime } = require('luxon');

class Carbon {
    static #formatMapping = {
        'Y-m-d H:i:s': 'yyyy-MM-dd HH:mm:ss',
        'Y-m-d': 'yyyy-MM-dd',
        'm/d/Y': 'MM/dd/yyyy',
        'd/m/Y': 'dd/MM/yyyy',
        'H:i:s': 'HH:mm:ss',
        'l, F j, Y': 'cccc, LLLL dd, yyyy',
        'l, F j, Y g:i A': 'cccc, LLLL dd, yyyy h:mm a',
        'r': "EEE, dd MMM yyyy HH:mm:ss Z",
        'U': 'T',
    };

    static #dateTime;

    static addDays(days = 0) {
        Carbon.#dateTime = Carbon.#generateDateTime().plus({ days });
        return Carbon;
    }

    static addHours(hours = 0) {
        Carbon.#dateTime = Carbon.#generateDateTime().plus({ hours });
        return Carbon;
    }

    static addMinutes(minutes = 0) {
        Carbon.#dateTime = Carbon.#generateDateTime().plus({ minutes });
        return Carbon;
    }

    static addSeconds(seconds = 0) {
        Carbon.#dateTime = Carbon.#generateDateTime().plus({ seconds });
        return Carbon;
    }

    static addYears(years = 0) {
        Carbon.#dateTime = Carbon.#generateDateTime().plus({ years });
        return Carbon;
    }

    static addMonths(months = 0) {
        Carbon.#dateTime = Carbon.#generateDateTime().plus({ months });
        return Carbon;
    }

    static addWeeks(weeks = 0) {
        Carbon.#dateTime = Carbon.#generateDateTime().plus({ weeks });
        return Carbon;
    }

    static #generateDateTime() {
        if (Carbon.#dateTime === undefined) {
            return DateTime.now().setZone(Configure.read('app.timzone'));
        } else {
            return Carbon.#dateTime;
        }
    }

    static getDateTime() {
        return Carbon.#getByFormat(Configure.read('app.datetime_format') || 'Y-m-d H:i:s');
    }

    static getDate() {
        return Carbon.#getByFormat(Configure.read('app.date_format') || 'Y-m-d');
    }

    static getTime() {
        return Carbon.#getByFormat(Configure.read('app.time_format') || 'H:i:s');
    }
    static #getByFormat(format) {
        if (Carbon.#dateTime === undefined) {
            Carbon.#dateTime = Carbon.#generateDateTime();
        }
        const time = Carbon.#dateTime;
        Carbon.#dateTime = undefined;
        return time.toFormat(Carbon.#formatMapping[format]);
    }
}

module.exports = Carbon;
