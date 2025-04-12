"use strict";
const fs = require('fs');
const path = require('path');
const Configure = require('../../../libraries/Materials/Configure');
const Carbon = require('../../../libraries/Materials/Carbon');
require('dotenv').config();

/**
 * This file assigns global variables and functions for the application.
 * It includes utility functions, configuration options, and other helpers
 * that can be used throughout the application.
 *
 * @module AssignGlobal
 */

Object.defineProperty(globalThis, 'functionDesigner', {
    value: (key, value) => {
        if (key in globalThis) {
            throw new Error(`The global variable "${key}" is already defined.`);
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

/**
 * Retrieves the value of the specified environment variable.
 * Returns `undefined` if the variable is not set.
 *
 * Usage:
 *   const value = env('MY_ENV_VAR');
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {string | null} The value of the environment variable, or `undefined` if not set.
*/

Object.defineProperty(globalThis, 'env', {
    value: (ENV_NAME, defaultValue = null) => {
        if (typeof ENV_NAME === 'string' && ENV_NAME !== '') {
            return process.env[ENV_NAME] !== undefined ? process.env[ENV_NAME] : defaultValue;
        } else {
            return null;
        }
    },
    writable: false,
    configurable: false,
});

/**
 * Restricts an object to only the specified keys.
 * Returns a new object containing only the provided keys and their associated values.
 *
 * Usage:
 *   const filtered = only(obj, ['key1', 'key2']);
 *
 * @param {Object} source - The object to filter.
 * @param {string[]} keys - The list of keys to include in the new object.
 * @returns {Object} A new object containing only the specified keys.
*/

Object.defineProperty(globalThis, 'only', {
    value: (obj, keys) => {
        let newObj = {};
        keys.forEach(key => {
            if (obj[key] !== undefined) {
                newObj[key] = obj[key];
            }
        });
        return newObj;
    },
    writable: false,
    configurable: false,
});

/**
 * Converts the first character of a string to uppercase while keeping the rest unchanged.
 *
 * Usage:
 *   const result = ucFirst('example'); // 'Example'
 *
 * @param {string} str - The string to transform.
 * @returns {string} The string with the first character capitalized.
*/

Object.defineProperty(globalThis, 'ucFirst', {
    value: (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    writable: false,
    configurable: false,
});

/**
 * Calculates a future date by adding a specified number of days to the current date.
 *
 * Usage:
 *   const futureDate = getFutureDate(5); // Returns the date 5 days from now
 *
 * @param {number} days - The number of days to add to the current date.
 * @returns {string} The future date in the format `Y-m-d H:i:s`.
*/

Object.defineProperty(globalThis, 'getFutureDate', {
    value: (addTime = 60) => {
        if (addTime == 'never') {
            return '9999-12-31 23:59:59';
        } else {
            return Carbon.addDays(addTime).getDateTime();
        }
    },
    writable: false,
    configurable: false,
});

// tmp_path
Object.defineProperty(globalThis, 'tmp_path', {
    value: () => {
        return `${base_path()}/tmp`;
    },
    writable: false,
    configurable: false,
});

/**
 * Writes the serialized content of a variable to a log file.
 * The log file will be created at `rootapplication/tmp/{logName}.log`.
 *
 * Usage:
 *   log({ key: 'value' }, 'debug'); // Writes the object to `tmp/debug.log`
 *
 * @param {any} variable - The variable to write into the log file. Can be any type (string, object, array, etc.).
 * @param {string} logName - The name of the log file (without extension).
 * @returns {void}
*/
class Logger {
    static log(value, destination, text = "") {
        const dirPath = path.join(tmp_path(), "logs");
        const logPath = path.join(dirPath, `${destination}.log`);
        const timestamp = Carbon.getDateTime();

        const logMessage = `${timestamp} ${text}\n${typeof value === "object" ? JSON.stringify(value, null, 2) : value
            }\n\n`;

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        if (!fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, "", "utf8");
        }

        if (env("NODE_ENV") === "production") {
            console.log(logMessage);
            return;
        }

        fs.appendFileSync(logPath, logMessage, "utf8");
    }
}

Object.defineProperty(globalThis, 'log', {
    value: (value, destination, text = "") => {
        Logger.log(value, destination, text);
    },
    writable: false,
    configurable: false,
});

/**
 * Retrieves the value of a configuration option, similar to Laravel's `config` helper function.
 * Supports dot notation for nested configuration keys.
 *
 * Usage:
 *   const value = config('app.name'); // Retrieves the value of `app.name`
 *   const value = config('database.connections.mysql.host'); // Retrieves the value of a nested key
 *
 * @param {string} key - The configuration key, which can use dot notation for nested values.
 * @returns {any} The value of the configuration option, or `undefined` if the key does not exist.
*/
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
    } else {
        throw new Error('Invalid number of arguments');
    }
});

/**
 * The base path of the application, typically the root directory.
 * This is used as the starting point for resolving all other paths.
*/
Object.defineProperty(globalThis, 'base_path', {
    value: () => {
        return path.join(__dirname, '..', '..', '..');
    },
    writable: false,
    configurable: false,
})

/**
 * The path to the application's resources directory, which typically contains views, translations, and other assets.
*/
Object.defineProperty(globalThis, 'resources_path', {
    value: () => {
        return `${base_path()}/resources`;
    },
    writable: false,
    configurable: false,
})

/**
 * The path to the application's view directory, where view files (such as Blade templates) are stored.
*/
Object.defineProperty(globalThis, 'view_path', {
    value: () => {
        return `${resources_path()}/views`;
    },
    writable: false,
    configurable: false,
})

/**
 * The path to the public directory, which is typically the web server's document root.
 * This is where publicly accessible files like images, JavaScript, and CSS are located.
*/
Object.defineProperty(globalThis, 'public_path', {
    value: () => {
        return `${base_path()}/public`;
    },
    writable: false,
    configurable: false,
})

/**
 * The path to the database directory, where database-related files or configurations might be stored.
*/
Object.defineProperty(globalThis, 'database_path', {
    value: () => {
        return `${base_path()}/main/database`;
    },
    writable: false,
    configurable: false,
})

/**
 * The path to the application's core directory, where the main application logic is stored.
*/
Object.defineProperty(globalThis, 'app_path', {
    value: () => {
        return `${base_path()}/app`;
    },
    writable: false,
    configurable: false,
})

/**
 * The path to the stub directory, where template files or skeleton code files (stubs) are stored.
*/
Object.defineProperty(globalThis, 'stub_path', {
    value: () => {
        return `${base_path()}/main/express/stubs`;
    },
    writable: false,
    configurable: false,
})

/**
 * Generates a table name based on the given model name.
 * Typically used to follow naming conventions for database tables.
 *
 * Usage:
 *   const tableName = generateTableNames('User'); // Generates 'users' table name
 *   const tableName = generateTableNames('Post'); // Generates 'posts' table name
 *
 * @param {string} modelName - The model name (e.g., 'User', 'Post') for which to generate the table name.
 * @returns {string} The generated table name, typically plural and in snake_case.
*/
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

/**
 * Encodes a string to standard Base64.
*/
functionDesigner('base64_encode', (str) => Buffer.from(str, 'utf-8').toString('base64'));

/**
 * Decodes a standard Base64 string to its original form.
*/
functionDesigner('base64_decode', (str) => Buffer.from(str, 'base64').toString('utf-8'));

/**
 * Encodes a string to Base64 in a URL-safe format (Base64url).
 * Replaces `+` with `-`, `/` with `_`, and removes any trailing `=` padding.
*/
functionDesigner('base64_encode_safe', function (str) {
    return Buffer.from(str)
        .toString('base64')        // Standard Base64 encode
        .replace(/\+/g, '-')       // Replace `+` with `-`
        .replace(/\//g, '_')       // Replace `/` with `_`
        .replace(/=+$/, '');       // Remove any trailing `=` padding
});

/**
 * Decodes a URL-safe Base64 string (Base64url) to its original form.
 * Replaces `-` with `+`, `_` with `/`, and adds padding if necessary.
*/
functionDesigner('base64_decode_safe', function (str) {
    // Add necessary padding if missing
    const padding = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return Buffer.from(base64, 'base64').toString('utf8');
});

/**
 * This function mimics PHP's strtotime by parsing a string containing a date or time
 * and returning the corresponding Unix timestamp (in seconds). It supports relative
 * date/time formats such as "next Friday" or "3 days ago" and adjusts based on the 
 * system's time zone.
*/
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

functionDesigner('strtotime', function (time, now) {
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
 * Represents the current date and time, returning it in the format "Y-m-d H:i:s" 
 * (Year-Month-Day Hour:Minute:Second). This is typically used to get the current 
 * timestamp formatted in a human-readable way, adjusted to the system's time zone.
*/

functionDesigner('NOW', () => {
    return Carbon.getDateTime();
});
functionDesigner('currentTime', NOW);

/**
 * This function returns the current date and time 
 * in the specified format (e.g., "Y-m-d H:i:s"). If no timestamp is provided, 
 * it returns the current system time formatted accordingly.
*/
functionDesigner('DATE', (format, unixTimestamp = null) => {
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
functionDesigner('function_exists', (variable) => {
    if (typeof variable === 'undefined') return false;
    return typeof variable === 'function';
});

// This function is use to define GLOBAL variable
functionDesigner('define', (key, value) => {
    if (key in globalThis) {
        throw new Error(`The global variable "${key}" is already defined.`);
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
    const defaultViewEngine = config('view.defaultViewEngine') || 'ejs';
    const renderer = require(defaultViewEngine);


    const templatePath = path.join(view_path(), `${viewName.split('.').join('/')}.${defaultViewEngine}`);
    // templatePathChecker
    if (!fs.existsSync(templatePath)) {
        throw `View file not found: ${templatePath}`;
    }
    const rawHtml = fs.readFileSync(templatePath, "utf-8");

    const rendered = renderer.render(rawHtml, data);
    return rendered;
});

define('FRAMEWORK_VERSION', require(path.join(base_path(), 'version')));

functionDesigner('response', function (html = null) {
    const ExpressResponse = require('./ExpressResponse');
    const EResponse = new ExpressResponse(html);
    return EResponse;
});