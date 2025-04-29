const fs = require('fs');
const path = require('path');
const Configure = require('../../../libraries/Materials/Configure');
const Carbon = require('../../../libraries/Materials/Carbon');
const ExpressView = require('../http/ExpressView');
require('dotenv').config();


/**************
 * @functions *
***************/

Object.defineProperty(globalThis, 'functionDesigner', {
    value: (key, value) => {
        if (key in globalThis) {
            return;
        }
        if (typeof value !== 'function') {
            throw new Error(`The value for "${key}" must be a function.`);
        }
        Object.defineProperty(globalThis, key, {
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

functionDesigner('getFutureDate', (addTime = 60) => {
    if (addTime == 'never') {
        return '9999-12-31 23:59:59';
    } else {
        return Carbon.addDays(addTime).getDateTime();
    }
});

functionDesigner('log', (value, destination, text = "") => {
    const Logger = require('../http/ExpressLogger');
    Logger.log(value, destination, text);
});

functionDesigner('config', function () {
    const args = arguments;
    if (args.length === 0) {
        throw new Error('No arguments provided');
    }
    if (typeof args[0] !== 'string') {
        throw new Error('First argument must be a string');
    }
    if (args.length === 1) {
        return Configure.read(args[0]);
    } else if (args.length === 2) {
        const pathString = args[0];
        const data = args[1];
        Configure.write(pathString, data);
        return data;
    } else {
        throw new Error('Invalid number of arguments');
    }
});

functionDesigner('base_path', (concatenation = '') => {
    return path.join(__dirname, '..', '..', '..', concatenation);
});

functionDesigner('resources_path', (concatenation = '') => {
    return path.join(base_path(), 'resources', concatenation);
});

functionDesigner('view_path', (concatenation = '') => {
    return path.join(resources_path(), 'views', concatenation);
});

functionDesigner('public_path', (concatenation = '') => {
    return path.join(base_path(), 'public', concatenation);
});

functionDesigner('database_path', (concatenation = '') => {
    return path.join(base_path(), 'main', 'database', concatenation);
});

functionDesigner('app_path', (concatenation = '') => {
    return path.join(base_path(), 'app', concatenation);
});

functionDesigner('stub_path', () => {
    return `${base_path()}/main/express/stubs`;
});

functionDesigner('tmp_path', () => {
    return `${base_path()}/tmp`;
});

functionDesigner('generateTableNames', (entity) => {
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
    const { DateTime } = require("luxon");

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

// This function is use to define GLOBAL variable
functionDesigner('define', (key, value) => {
    if (key in globalThis) {
        return;
    }
    Object.defineProperty(globalThis, key, {
        value: value,
        writable: true,
        configurable: false,
    });
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

define('FRAMEWORK_VERSION', require(path.join(base_path(), 'version')));

functionDesigner('response', function (html = null) {
    const ExpressResponse = require('../http/ExpressResponse');
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
    const { default: axios } = require('axios');
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