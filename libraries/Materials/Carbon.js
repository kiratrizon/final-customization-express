const Configure = require("./Configure");
const { DateTime } = require('luxon');

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
    };
    static addDays(days = 0) {
        Carbon.#timeAlters = days;
        return Carbon;
    }

    static addHours(hours = 0) {
        Carbon.#timeAlters = hours;
        return Carbon;
    }

    static addMinutes(minutes = 0) {
        Carbon.#timeAlters = minutes;
        return Carbon;
    }

    static addSeconds(seconds = 0) {
        Carbon.#timeAlters = seconds;
        return Carbon;
    }

    static addYears(years = 0) {
        Carbon.#timeAlters = years;
        return Carbon;
    }

    static addMonths(months = 0) {
        Carbon.#timeAlters = months;
        return Carbon;
    }

    static addWeeks(weeks = 0) {
        Carbon.#timeAlters = weeks;
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

    // static adjustTime(alterTime) {
    //     let altered = alterTime.replace(/\s+/g, ''); // replace all spaces
    //     altered.toLowerCase();
    //     let currentAlter = '';
    //     let currentNumber = '';
    //     let currentOperator = '';
    //     const chars = 'secondmiuthrywka'.split('');
    //     const numbers = '1234567890'.split('');
    //     const acceptedOperator = [
    //         '+',
    //         '-'
    //     ];
    //     const completeAlters = [
    //         'days',
    //         'hours',
    //         'minutes',
    //         'weeks',
    //         'years',
    //         'months',
    //         'seconds'
    //     ];
    //     // loop the altered string
    //     for (let i = 0; i < altered.length; i++) {
    //         const char = altered[i];
    //         if (numbers.includes(char)) {
    //             currentNumber += char;
    //         } else if (acceptedOperator.includes(char)) {
    //             if (currentOperator === '') {
    //                 currentOperator = char;
    //             } else {
    //                 throw new Error(`Invalid time adjustment`);
    //             }
    //         } else if (chars.includes(char)) {
    //             if (currentOperator === '') {
    //                 currentOperator = '+';
    //             }
    //             if (currentNumber === '') {
    //                 throw new Error(`Invalid time adjustment`);
    //             }
    //             currentAlter += char;
    //         } else {
    //             throw new Error(`Invalid time adjustment`);
    //         }
    //         if (completeAlters.includes(currentAlter)) {
    //             if (currentOperator === '' || currentNumber === '') {
    //                 throw new Error(`Invalid time adjustment`);
    //             }
    //             const completAlt = ucFirst(currentAlter);
    //             eval(`Carbon.add${completAlt}(${currentOperator == '+' ? '' : currentOperator}${currentNumber})`);
    //             currentAlter = '';
    //             currentNumber = '';
    //             currentOperator = '';
    //         }
    //     }
    // }

    static #reset() {
        Carbon.#timeAlters = {
            "weeks": 0,
            "months": 0,
            "days": 0,
            "hours": 0,
            "minutes": 0,
            "seconds": 0,
        };
    }
}

module.exports = Carbon;
