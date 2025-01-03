const fs = require('fs');
const path = require('path');
const Configure = require('../../../libraries/Materials/Configure');
const Carbon = require('../../../libraries/Materials/Carbon');
require('dotenv').config();

globalThis.env = (ENV_NAME, defaultValue = null) => {
    if (typeof ENV_NAME === 'string' && ENV_NAME !== '') {
        return process.env[ENV_NAME] !== undefined ? process.env[ENV_NAME] : defaultValue;
    } else {
        return null;
    }
}

globalThis.only = (obj, keys) => {
    let newObj = {};
    keys.forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

globalThis.ucFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

globalThis.formatTimestamp = () => {
    const dateNow = new Date();
    const year = dateNow.getFullYear();
    const month = String(dateNow.getMonth() + 1).padStart(2, '0');
    const day = String(dateNow.getDate()).padStart(2, '0');
    const hours = String(dateNow.getHours()).padStart(2, '0');
    const minutes = String(dateNow.getMinutes()).padStart(2, '0');
    const seconds = String(dateNow.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

globalThis.formatDate = (date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

globalThis.getFutureDate = (addTime = 60) => {
    if (addTime == 'never') {
        return '9999-12-31 23:59:59';
    } else {
        const now = new Date();
        const futureDate = new Date(now.getTime() + addTime * 24 * 60 * 60 * 1000);
        return formatDate(futureDate);
    }
};

globalThis.log = (value, destination, text = "") => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    const dirPath = path.join(__dirname, '..', '..', '..', 'tmp');
    const logPath = path.join(dirPath, `${destination}.log`);
    const timestamp = formatTimestamp();

    const logMessage = `${timestamp} ${text}\n${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}\n\n`;

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '', 'utf8');
    }

    fs.appendFileSync(logPath, logMessage, 'utf8');
};

globalThis.config = (finder) => {
    return Configure.read(finder);
};

globalThis.base_path = () => {
    return path.join(__dirname, '..', '..', '..');
}

globalThis.resources_path = () => {
    return `${base_path()}/resources`;
}

globalThis.view_path = () => {
    return `${base_path()}/resources/views`;
}

globalThis.public_path = () => {
    return `${base_path()}/public`;
}

globalThis.database_path = () => {
    return `${base_path()}/main/database`;
}

globalThis.app_path = () => {
    return `${base_path()}/app`;
}

globalThis.stub_path = () => {
    return `${base_path()}/main/express/stubs`;
}

globalThis.generateTableNames = (entity) => {
    const irregularPlurals = config('irregular_words');
    const splitWords = entity.split(/(?=[A-Z])/);
    const lastWord = splitWords.pop().toLowerCase();

    const pluralizedLastWord = (() => {
        if (irregularPlurals[lastWord]) {
            return irregularPlurals[lastWord];
        }
        if (lastWord.endsWith('y')) {
            return lastWord.slice(0, -1) + 'ies';
        }
        if (['s', 'x', 'z', 'ch', 'sh'].some((suffix) => lastWord.endsWith(suffix))) {
            return lastWord + 'es';
        }
        return lastWord + 's';
    })();

    return [...splitWords, pluralizedLastWord].join('').toLowerCase()
}

globalThis.base64_encode = function (str) {
    return Buffer.from(str)
        .toString('base64')        // Standard Base64 encode
        .replace(/\+/g, '-')       // Replace `+` with `-`
        .replace(/\//g, '_')       // Replace `/` with `_`
        .replace(/=+$/, '');       // Remove any trailing `=` padding
}

globalThis.base64_decode = function (str) {
    // Add necessary padding if missing
    const padding = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return Buffer.from(base64, 'base64').toString('utf8');
}

globalThis.strtotime = function (text, dateNow = null) {
    if (dateNow === null) {
        dateNow = new Date(); // Use the current time if no `dateNow` is provided
    }

    const relativeRegex = /([+-]?\d+)\s*(second|minute|hour|day|week|month|year)s?/i;
    const exactTimeRegexes = [
        // Handle Date-Time format Y-m-d H:i:s
        {
            regex: /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/i,
            handler: (date, time) => new Date(date + 'T' + time).getTime(),
        },
        // Handle Date-Time format Y-m-d H:i
        {
            regex: /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/i,
            handler: (date, time) => new Date(date + 'T' + time + ':00').getTime(),
        },
        // Handle Date format Y-m-d
        {
            regex: /^(\d{4}-\d{2}-\d{2})$/i,
            handler: (date) => new Date(date).getTime(),
        },
        // Handle m-d-Y
        {
            regex: /^(\d{2})-(\d{2})-(\d{4})$/i,
            handler: (month, day, year) => new Date(`${year}-${month}-${day}`).getTime(),
        },
    ];

    // Relative time
    if (relativeRegex.test(text)) {
        const match = text.match(relativeRegex);
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const unitsToMilliseconds = {
            second: 1000,
            minute: 1000 * 60,
            hour: 1000 * 60 * 60,
            day: 1000 * 60 * 60 * 24,
            week: 1000 * 60 * 60 * 24 * 7,
            month: 1000 * 60 * 60 * 24 * 30, // Approximation
            year: 1000 * 60 * 60 * 24 * 365, // Approximation
        };

        return Math.floor(dateNow.getTime() / 1000) + Math.floor(value * (unitsToMilliseconds[unit] / 1000));
    }

    // Exact time
    for (const { regex, handler } of exactTimeRegexes) {
        const match = text.match(regex);
        if (match) {
            return Math.floor(handler(...match.slice(1)) / 1000);
        }
    }

    return null; // Return null if no pattern matches
};

globalThis.NOW = globalThis.currentTime = () => {
    return Carbon.getDateTime();
}

globalThis.date = globalThis.DATE = (format, unixTimestamp = null) => {
    if (unixTimestamp !== null) {
        return Carbon.getByUnixTimestamp(unixTimestamp, format);
    }
    return Carbon.getByFormat(format);
};

globalThis.function_exists = (variable) => {
    if (typeof variable === 'undefined') return false;
    return typeof variable === 'function';
}

globalThis.$_POST = {};
globalThis.$_GET = {};
globalThis.$_FILES = {};
globalThis.REQUEST = {};
globalThis.$_SERVER = {};
globalThis.$_COOKIE = {};
globalThis.setcookie = null;
globalThis.$_SESSION = {};

/** Placeholder for a function that will dump variable contents for debugging. */
globalThis.dump = null;

/** Placeholder for a function that will dump variable contents and terminate execution. */
globalThis.dd = null;

/** Placeholder for a function that will send JSON responses. */
globalThis.jsonResponse = null;

/** Placeholder for a function that will render views or templates. */
globalThis.view = null;

/** Placeholder for a function that will handle redirection to a given URL. */
globalThis.redirect = null;

/** Placeholder for a function that will navigate back to the previous page. */
globalThis.back = null;

/** Placeholder for a function that will check if a given URL is an API endpoint. */
globalThis.isApiUrl = null;

/** Placeholder for a function that will define application routes. */
globalThis.route = null;

globalThis.BASE_URL = null;
globalThis.PATH_URL = null;
globalThis.PATH_QUERY = null;
globalThis.ORIGINAL_URL = null;
globalThis.DEFAULT_BACK = null;