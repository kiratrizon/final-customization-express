// Load environment variables
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { DateTime } from 'luxon';
import axios from 'axios';

import { fileURLToPath, pathToFileURL } from 'url';
dotenv.config();
Object.defineProperty(global, 'functionDesigner', {
    value: (key = '', value = null) => {
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

functionDesigner('env', (ENV_NAME = '', defaultValue = null) => {
    if (typeof ENV_NAME === 'string' && ENV_NAME !== '') {
        return process.env[ENV_NAME] || defaultValue;
    } else {
        return null;
    }
});

functionDesigner('define', (key = '', value = null, configurable = true) => {
    if (key in global) {
        return;
    }
    Object.defineProperty(global, key, {
        value: value,
        writable: true,
        configurable,
    });
});

functionDesigner('isDefined', (key = '') => {
    if (key in global) {
        return true;
    }
    return false;
});

functionDesigner('dynamicImport', async (file = '') => {
    try {
        const data = await import(pathToFileURL(path.join(file)).href);
        return data;
    } catch (error) {
        console.error(`Error importing module: ${error}`);
        return null;
    }
});

functionDesigner('basePath', (concatenation = '') => {
    return path.join(process.cwd(), concatenation);
});

import Configure from '../../../libraries/Materials/Configure.mjs';
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
const dbType = await config('app.database.database') || 'sqlite';
define('dbUsed', dbType, false);
const isProduction = env('NODE_ENV') === 'production' || env('NODE_ENV') === 'prod';
define('IN_PRODUCTION', isProduction, false);

/**************
 * @functions *
***************/
functionDesigner('only', (obj = {}, keys = []) => {
    let newObj = {};
    keys.forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
});

functionDesigner('except', (obj = {}, keys = []) => {
    let newObj = {};
    for (let key in obj) {
        if (!keys.includes(key)) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
})

functionDesigner('ucFirst', (string = '') => {
    return string.charAt(0).toUpperCase() + string.slice(1);
});

import Logger from '../http/ExpressLogger.mjs';
functionDesigner('log', (value = '', destination = '', text = "") => {
    Logger.log(value, destination, text);
});

functionDesigner('resourcesPath', (concatenation = '') => {
    return basePath(path.join('resources', concatenation));
});

functionDesigner('viewPath', (concatenation = '') => {
    return resourcesPath(path.join('views', concatenation));
});

functionDesigner('publicPath', (concatenation = '') => {
    return basePath(path.join('public', concatenation));
});

functionDesigner('databasePath', (concatenation = '') => {
    return basePath(path.join('main', 'database', concatenation));
});

functionDesigner('appPath', (concatenation = '') => {
    return basePath(path.join('app', concatenation));
});

functionDesigner('stubPath', () => {
    return basePath('main/express/stubs');
});

functionDesigner('controllerPath', () => {
    return appPath('Controllers');
})

functionDesigner('tmpPath', () => {
    return basePath('tmp');
});

functionDesigner('pathExist', (fileString = '') => {
    if (fileString === '') {
        return false;
    }
    const returndata = fs.existsSync(fileString);
    return returndata;
});

functionDesigner('writeFile', (fileString = '', content = '') => {
    if (fileString === '') {
        throw new Error('Filename is required.');
    }
    fs.writeFileSync(fileString, content, 'utf8');
});

functionDesigner('makeDir', (dirString = '') => {
    if (dirString === '') {
        throw new Error('Directory path is required.');
    }
    // Check if the directory exists, and create it if it doesn't
    if (!fs.existsSync(dirString)) {
        fs.mkdirSync(dirString, { recursive: true });
    }
});

functionDesigner('appendFile', (fileString = '', content = '') => {
    if (fileString === '') {
        return;  // Return early if no filename is provided
    }

    try {
        // Append content to the file, creating it if it doesn't exist
        fs.appendFileSync(fileString, content, 'utf8');
    } catch (err) {
        return;  // Return if there's an error, no exception thrown
    }
});

functionDesigner('getFileContents', (fileString = '') => {
    if (fileString === '') {
        return '';  // Return empty string if no filename is provided
    }

    const basePath = path.join('..', '..', '..');

    try {
        // Read and return the file content as a UTF-8 string
        return fs.readFileSync(fileString, 'utf8');
    } catch (err) {
        return '';  // Return empty string if there's an error
    }
});

const irregularPlurals = await config('irregular_words');

functionDesigner('generateTableNames', (entity = '') => {
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

functionDesigner('base64encode', (str = '', safe = false) => {
    if (safe) {
        return Buffer.from(str)
            .toString('base64')        // Standard Base64 encode
            .replace(/\+/g, '-')       // Replace `+` with `-`
            .replace(/\//g, '_')       // Replace `/` with `_`
            .replace(/=+$/, '');       // Remove any trailing `=` padding
    }
    return Buffer.from(str).toString('base64');
});

functionDesigner('base64decode', (str = '', safe = false) => {
    if (safe) {
        // Add necessary padding if missing
        const padding = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
        return Buffer.from(base64, 'base64').toString('utf8');
    }
    return Buffer.from(str, 'base64').toString('utf8');
});

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
const timeZone = (typeof config === "function" && (await config("app.timezone"))) ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;
functionDesigner('strtotime', function (time, now) {
    if (typeof time !== 'string') {
        return null;
    }
    now = now || Date.now() / 1000;
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

const configApp = await config('app');

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

    #timeAlters = {
        "weeks": 0,
        "months": 0,
        "days": 0,
        "hours": 0,
        "minutes": 0,
        "seconds": 0,
        "years": 0,
    };
    addDays(days = 0) {
        this.#timeAlters['days'] += days;
        return this;
    }

    addHours(hours = 0) {
        this.#timeAlters['hours'] += hours;
        return this;
    }

    addMinutes(minutes = 0) {
        this.#timeAlters['minutes'] += minutes;
        return this;
    }

    addSeconds(seconds = 0) {
        this.#timeAlters['seconds'] += seconds;
        return this;
    }

    addYears(years = 0) {
        this.#timeAlters['years'] += years;
        return this;
    }

    addMonths(months = 0) {
        this.#timeAlters['months'] += months;
        return this;
    }

    addWeeks(weeks = 0) {
        this.#timeAlters['weeks'] += weeks;
        return this;
    }

    #generateDateTime() {
        const getDateTime = DateTime.now().plus({
            years: this.#timeAlters.years,
            months: this.#timeAlters.months,
            weeks: this.#timeAlters.weeks,
            days: this.#timeAlters.days,
            hours: this.#timeAlters.hours,
            minutes: this.#timeAlters.minutes,
            seconds: this.#timeAlters.seconds,
        }).setZone(configApp.timezone || 'UTC');
        return getDateTime;
    }

    getDateTime() {
        return this.#getByFormat(configApp.datetime_format || 'Y-m-d H:i:s');
    }

    getDate() {
        return this.#getByFormat(configApp.date_format || 'Y-m-d');
    }

    getTime() {
        return this.#getByFormat(configApp.time_format || 'H:i:s');
    }
    #getByFormat(format) {
        if (typeof format != 'string') {
            throw new Error(`Invalid format`);
        }
        const time = this.#generateDateTime();
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

    getByFormat(format) {
        return this.#getByFormat(format);
    }

    getByUnixTimestamp(unixTimestamp, format) {
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

functionDesigner('DATE', (format = 'Y-m-d H:i:s', unixTimestamp = null) => {
    const carbon = new Carbon();
    if (unixTimestamp !== null) {
        return carbon.getByUnixTimestamp(unixTimestamp, format);
    }
    return carbon.getByFormat(format);
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

functionDesigner('transferFile', (oldPath = '', newPath = '') => {
    try {
        if (!oldPath || !newPath) return;
        fs.renameSync(oldPath, newPath);
    } catch (err) {
        return;
    }
});

import version from '../../../version.mjs';
define('FRAMEWORK_VERSION', version, false);

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

functionDesigner('json_encode', (data) => {
    return JSON.stringify(data);
});

functionDesigner('json_decode', (data) => {
    if (is_string(data)) {
        return JSON.parse(data);
    }
    return data;
});