import Configure from './Configure.mjs';
import { DateTime } from 'luxon';


class Carbon {
    static #formatMapping = {
        'Y': 'yyyy', // Full year, 4 digits
        'y': 'yy', // Short year, 2 digits
        'm': 'MM', // Month number, 2 digits
        'n': 'M', // Month number, without leading zero
        'd': 'dd', // Day of the month, 2 digits
        'j': 'd', // Day of the month, without leading zero
        'H': 'HH', // Hour (24-hour format)
        'h': 'hh', // Hour (12-hour format)
        'i': 'mm', // Minutes
        's': 'ss', // Seconds
        'A': 'a', // AM/PM
        'T': 'z', // Timezone abbreviation
        'e': 'ZZ', // Full timezone name (if available)
        'o': 'yyyy', // ISO-8601 year
        'P': 'ZZ', // ISO-8601 timezone offset
        'c': "yyyy-MM-dd'T'HH:mm:ssZZ", // ISO-8601 full date/time
        'r': 'EEE, dd MMM yyyy HH:mm:ss Z', // RFC 2822
        'u': 'yyyy-MM-dd HH:mm:ss.SSS', // Microseconds
        'W': 'W', // ISO week number
        'N': 'E', // ISO day of the week (1 = Monday, 7 = Sunday)
        'z': 'o', // Day of the year
    };

    static #timeAlters = {
        "weeks": 0,
        "months": 0,
        "days": 0,
        "hours": 0,
        "minutes": 0,
        "seconds": 0,
        "years": 0,
    };
    static addDays(days = 0) {
        Carbon.#timeAlters['days'] += days;
        return Carbon;
    }

    static addHours(hours = 0) {
        Carbon.#timeAlters['hours'] += hours;
        return Carbon;
    }

    static addMinutes(minutes = 0) {
        Carbon.#timeAlters['minutes'] += minutes;
        return Carbon;
    }

    static addSeconds(seconds = 0) {
        Carbon.#timeAlters['seconds'] += seconds;
        return Carbon;
    }

    static addYears(years = 0) {
        Carbon.#timeAlters['years'] += years;
        return Carbon;
    }

    static addMonths(months = 0) {
        Carbon.#timeAlters['months'] += months;
        return Carbon;
    }

    static addWeeks(weeks = 0) {
        Carbon.#timeAlters['weeks'] += weeks;
        return Carbon;
    }

    static #generateDateTime() {
        // return DateTime.now().setZone(Configure.read('app.timezone'));
        // add the #timeAlters if there is value before returning DateTime.now().setZone(Configure.read('app.timezone'))
        const getDateTime = DateTime.now().plus({
            years: Carbon.#timeAlters.years,
            months: Carbon.#timeAlters.months,
            weeks: Carbon.#timeAlters.weeks,
            days: Carbon.#timeAlters.days,
            hours: Carbon.#timeAlters.hours,
            minutes: Carbon.#timeAlters.minutes,
            seconds: Carbon.#timeAlters.seconds,
        }).setZone(Configure.read('app.timezone'));
        Carbon.#reset();
        return getDateTime;
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
        if (typeof format != 'string') {
            throw new Error(`Invalid format`);
        }
        const time = Carbon.#generateDateTime();
        const formattings = Object.keys(Carbon.#formatMapping);
        let newFormat = '';
        for (let i = 0; i < format.length; i++) {
            if (formattings.includes(format[i])) {
                newFormat += Carbon.#formatMapping[format[i]];
            } else {
                newFormat += format[i];
            }
        }
        return time.toFormat(newFormat);
    }

    static getByFormat(format) {
        return Carbon.#getByFormat(format);
    }

    static #reset() {
        Carbon.#timeAlters = {
            "weeks": 0,
            "months": 0,
            "days": 0,
            "hours": 0,
            "minutes": 0,
            "seconds": 0,
            "years": 0,
        };
    }

    static getByUnixTimestamp(unixTimestamp, format) {
        if (typeof unixTimestamp !== 'number') {
            throw new Error(`Invalid Unix timestamp: ${unixTimestamp}`);
        }
        if (typeof format !== 'string') {
            throw new Error(`Invalid format: ${format}`);
        }

        const time = DateTime.fromSeconds(unixTimestamp).setZone(Configure.read('app.timezone'));
        const formattings = Object.keys(Carbon.#formatMapping);
        let newFormat = '';
        for (let i = 0; i < format.length; i++) {
            if (formattings.includes(format[i])) {
                newFormat += Carbon.#formatMapping[format[i]];
            } else {
                newFormat += format[i];
            }
        }
        return time.toFormat(newFormat);
    }
}

export default Carbon;
