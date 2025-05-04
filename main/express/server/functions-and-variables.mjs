// Load environment variables
dotenv.config();
Object.defineProperty(global, 'functionDesigner', {
    value: (key, value) => {
        if (key in global) {
            return;
        }
        if (typeof value !== 'function') {
            throw new Error(`The value for "${key}" must be a function.`);
        }
        Object.defineProperty(global, key, {
            value: value,
            writable: false,
            configurable: false,
        });
    },
    writable: false,
    configurable: false,
});

functionDesigner('env', (ENV_NAME, defaultValue = null) => {
    if (typeof ENV_NAME === 'string' && ENV_NAME !== '') {
        return process.env[ENV_NAME] || defaultValue;
    } else {
        return null;
    }
});

functionDesigner('dynamic_import', (concatenation = '') => {
    if (isProduction) {
        return pathToFileURL(concatenation).href;
    }
    return concatenation;
});

import Configure from '../../../libraries/Materials/Configure.mjs';

// This function is use to define GLOBAL variable
functionDesigner('define', (key, value) => {
    if (key in global) {
        return;
    }
    Object.defineProperty(global, key, {
        value: value,
        writable: true,
        configurable: false,
    });
});

functionDesigner('config', async function () {
    const args = arguments;
    if (args.length === 0) {
        throw new Error('No arguments provided');
    }
    if (typeof args[0] !== 'string') {
        throw new Error('First argument must be a string');
    }
    if (args.length === 1) {
        return await Configure.read(args[0]);
    } else if (args.length === 2) {
        const pathString = args[0];
        const data = args[1];
        await Configure.write(pathString, data);
        return data;
    } else {
        throw new Error('Invalid number of arguments');
    }
});

const isProduction = env('NODE_ENV') === 'production' || env('NODE_ENV') === 'prod';
define('IN_PRODUCTION', isProduction);

import fs from 'fs';
import path from 'path';
import ExpressView from '../http/ExpressView.mjs';
import AppProviders from '../../../app/Providers/AppProviders.mjs';
import dotenv from 'dotenv';
import { DateTime } from 'luxon';
import axios from 'axios';

import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**************
 * @functions *
***************/
functionDesigner('only', (obj, keys) => {
    let newObj = {};
    keys.forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
});

functionDesigner('except', (obj, keys) => {
    let newObj = {};
    for (let key in obj) {
        if (!keys.includes(key)) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
})

functionDesigner('ucFirst', (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
});

import Logger from '../http/ExpressLogger.mjs';

functionDesigner('log', (value, destination, text = "") => {
    Logger.log(value, destination, text);
});

functionDesigner('base_path', (concatenation = '') => {
    __dirname;
    return path.resolve(__dirname, '..', '..', '..', concatenation);
});

functionDesigner('resources_path', (concatenation = '') => {
    return base_path(path.join('resources', concatenation));
});

functionDesigner('view_path', (concatenation = '') => {
    return resources_path(path.join('views', concatenation));
});

functionDesigner('public_path', (concatenation = '') => {
    return base_path(path.join('public', concatenation));
});

functionDesigner('database_path', (concatenation = '') => {
    return base_path(path.join('main', 'database', concatenation));
});

functionDesigner('app_path', (concatenation = '') => {
    return base_path(path.join('app', concatenation));
});

functionDesigner('stub_path', () => {
    return base_path('main/express/stubs');
});

functionDesigner('controller_path', () => {
    return app_path('Controllers');
})

functionDesigner('tmp_path', () => {
    return base_path('tmp');
});

const irregularPlurals = await config('irregular_words');

functionDesigner('generateTableNames', (entity) => {
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
});

functionDesigner('dynamicImport', (path) => {
    if (typeof path !== 'string') return null;
    return pathToFileURL(path).href;
});

functionDesigner('base64_encode', (str) => Buffer.from(str, 'utf-8').toString('base64'));

functionDesigner('base64_decode', (str) => Buffer.from(str, 'base64').toString('utf-8'));

functionDesigner('base64_url_encode', function (str) {
    return Buffer.from(str)
        .toString('base64')        // Standard Base64 encode
        .replace(/\+/g, '-')       // Replace `+` with `-`
        .replace(/\//g, '_')       // Replace `/` with `_`
        .replace(/=+$/, '');       // Remove any trailing `=` padding
});

functionDesigner('base64_url_decode', function (str) {
    // Add necessary padding if missing
    const padding = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return Buffer.from(base64, 'base64').toString('utf8');
});


functionDesigner('strtotime', function (time, now) {
    const getRelativeTime = (expression, direction, now) => {
        const daysOfWeek = [
            "sunday", "monday", "tuesday", "wednesday",
            "thursday", "friday", "saturday"
        ];

        const lowerExpression = expression.toLowerCase();
        const dayIndex = daysOfWeek.indexOf(lowerExpression);

        if (dayIndex !== -1) {
            let daysDifference = dayIndex - now.weekday;

            if (direction === "next" && daysDifference <= 0) {
                daysDifference += 7;
            } else if (direction === "last" && daysDifference >= 0) {
                daysDifference -= 7;
            }

            return now.plus({ days: daysDifference }).toSeconds();
        }

        return now[direction === "next" ? "plus" : "minus"]({ days: 7 }).toSeconds();
    };

    now = now || Date.now() / 1000;

    const timeZone = (typeof config === "function" && config("app.timezone")) ||
        Intl.DateTimeFormat().resolvedOptions().timeZone;

    const adjustedNow = DateTime.fromSeconds(now).setZone(timeZone);

    time = time.trim().toLowerCase();

    if (Date.parse(time)) {
        return DateTime.fromISO(time, { zone: timeZone }).toSeconds();
    }

    const regexPatterns = {
        next: /^next\s+(.+)/,
        last: /^last\s+(.+)/,
        ago: /(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago$/,
        specificTime: /(\d{4}-\d{2}-\d{2})|(\d{2}:\d{2}(:\d{2})?)/,
    };

    const agoMatch = time.match(regexPatterns.ago);
    if (agoMatch) {
        const num = parseInt(agoMatch[1]);
        const unit = agoMatch[2];
        return adjustedNow.minus({ [unit]: num }).toSeconds();
    }

    const nextMatch = time.match(regexPatterns.next);
    if (nextMatch) {
        return getRelativeTime(nextMatch[1], "next", adjustedNow);
    }

    const lastMatch = time.match(regexPatterns.last);
    if (lastMatch) {
        return getRelativeTime(lastMatch[1], "last", adjustedNow);
    }

    return null;
});

const configApp = await config('app') || 'Y-m-d H:i:s';

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
        }).setZone(configApp.timezone || 'GMT +08');
        Carbon.#reset();
        return getDateTime;
    }

    static getDateTime() {
        return Carbon.#getByFormat(configApp.datetime_format || 'Y-m-d H:i:s');
    }

    static getDate() {
        return Carbon.#getByFormat(configApp.date_format || 'Y-m-d');
    }

    static getTime() {
        return Carbon.#getByFormat(configApp.time_format || 'H:i:s');
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

        const time = DateTime.fromSeconds(unixTimestamp).setZone(configApp.timezone || 'GMT +08');
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

/**
 * This function returns the current date and time 
 * in the specified format (e.g., "Y-m-d H:i:s"). If no timestamp is provided, 
 * it returns the current system time formatted accordingly.
*/
functionDesigner('DATE', (format = 'Y-m-d H:i:s', unixTimestamp = null) => {
    if (unixTimestamp !== null) {
        return Carbon.getByUnixTimestamp(unixTimestamp, format);
    }
    return Carbon.getByFormat(format);
});

functionDesigner('date', DATE);

/**
 * Checks whether a given function is defined in the current scope. 
 * It returns true if the function exists, otherwise false.
*/
functionDesigner('is_function', (variable) => {
    if (typeof variable === 'undefined') return false;
    return typeof variable === 'function';
});

/** Placeholder for a function that will render views or templates. */
functionDesigner('view', (viewName, data = {}) => {

    data.old = function (key) {
        return 'test';
    }
    const newView = new ExpressView(data);
    const rendered = newView.element(viewName);
    return newView.view(rendered);
});

// import path from 'path';

import version from '../../../version.mjs';
define('FRAMEWORK_VERSION', version);


import ExpressResponse from '../http/ExpressResponse.mjs';
functionDesigner('response', function (html = null) {
    const EResponse = new ExpressResponse(html);
    return EResponse;
});

functionDesigner('transferFile', (filePath, destination) => {
    if (typeof filePath !== 'string' || typeof destination !== 'string') {
        console.warn(new Error('Both filePath and destination must be strings'));
        return false;
    }

    const ensureDirectoryExistence = (filePath) => {
        const dir = path.dirname(filePath);
        if (fs.existsSync(dir)) {
            return true;
        }
        fs.mkdirSync(dir, { recursive: true });
        return true;
    };
    // Ensure the target directory exists
    ensureDirectoryExistence(destination);

    let done = false;
    let forReturn = false;

    // Use fs.rename to move the file
    fs.rename(filePath, destination, (err) => {
        if (err) {
            forReturn = false;
            done = true;
        } else {
            forReturn = true;
            done = true;
        }
    });

    // Loop until the operation is complete
    loopWhile(() => !done);
    return forReturn;
});

functionDesigner('fetchData', async (url, data = {
    timeout: 5000,
    method: 'GET',
    headers: {},
    body: {},
    params: {},
    responseType: 'json',
    onUploadProgress: null,    // Optional: Function to handle upload progress
    onDownloadProgress: null,  // Optional: Function to handle download progress
}) => {
    let { timeout, method, headers, body, params, responseType, onDownloadProgress, onUploadProgress } = data;

    const methodLower = method.toLowerCase();
    const allowedMethods = ['get', 'post', 'put', 'delete', 'patch'];

    if (!allowedMethods.includes(methodLower)) {
        console.error(new Error(`Invalid HTTP method: ${method}. Allowed methods are: ${allowedMethods.join(', ')}`));
        return [true, null];
    }

    const config = {
        timeout,
        headers,
        params,
        responseType
    };
    if (typeof onDownloadProgress === 'function') {
        config.onDownloadProgress = onDownloadProgress;
    }
    if (typeof onUploadProgress === 'function') {
        config.onUploadProgress = onUploadProgress;
    }

    if (['post', 'put', 'patch'].includes(methodLower)) {
        config.data = body;
    }

    let returnData = [true, null];
    try {
        const data = await axios[methodLower](url, config);
        returnData = [false, data.data];
    } catch (e) {
        if (e.response) {
            returnData = [true, e.response.data];
        } else if (e.request) {
            returnData = [true, e.request];
        } else {
            returnData = [true, e.message];
        }
    }
    return returnData;
});

// is_string
functionDesigner('is_string', (value) => {
    return typeof value === 'string';
});

// is_array
functionDesigner('is_array', (value) => {
    return Array.isArray(value);
});

// is_object
functionDesigner('is_object', (value) => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
});

// is_numeric
functionDesigner('is_numeric', (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
});

// is_integer
functionDesigner('is_integer', (value) => {
    return Number.isInteger(value);
});
// is_float
functionDesigner('is_float', (value) => {
    return typeof value === 'number' && !Number.isInteger(value);
});
// is_boolean
functionDesigner('is_boolean', (value) => {
    return typeof value === 'boolean';
});
// is_null
functionDesigner('is_null', (value) => {
    return value === null;
});

// isset
functionDesigner('isset', (value) => {
    return typeof value !== 'undefined' && value !== null;
});

functionDesigner('key_exist', (object, key) => {
    if (typeof object !== 'object' || object === null) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(object, key);
})

// empty
functionDesigner('empty', (value) => {
    if (
        is_null(value)
        || (is_array(value) && value.length === 0)
        || (is_object(value) && Object.keys(value).length === 0)
        || is_string(value) && value.trim() === ''
        || value === undefined
    ) {
        return true;
    }
    return false;
});

// method_exist
functionDesigner('method_exist', (object, method) => {
    return typeof object[method] === 'function';
});

const appProviders = await AppProviders.register();
functionDesigner('use', (className) => {
    if (className in appProviders) {
        return appProviders[className];
    }
    return null;
});

functionDesigner('json_encode', (data) => {
    return JSON.stringify(data);
});

functionDesigner('json_decode', (data) => {
    if (is_string(data)) {
        return JSON.parse(data);
    }
    return data;
});


/**************
 * @variables *
***************/

/** Placeholder for a function that will navigate back to the previous page. */
define('back', () => { })

/** Placeholder for a function that will define application routes. */
define('route', () => { })

define('$_SERVER', {})
define('setcookie', () => { })

define('request', () => { });

/** Placeholder for a function that will dump variable contents for debugging. */
define('dump', () => { });

/** Placeholder for a function that will dump variable contents and terminate execution. */
define('dd', () => { });
define('response_error', () => { })

define('BASE_URL', '');
define('PATH_URL', '');
define('QUERY_URL', '');
define('ORIGINAL_URL', '');
define('$_POST', {});
define('$_GET', {});
define('$_FILES', {});
define('$_SESSION', {});
define('$_COOKIE', {});

define('isRequest', null);