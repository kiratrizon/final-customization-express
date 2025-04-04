require('./AssignGlobal');
const fs = require('fs');
const path = require('path');
const Configure = require('../../../libraries/Materials/Configure');
const Carbon = require('../../../libraries/Materials/Carbon');
require('dotenv').config();

env = (ENV_NAME, defaultValue = null) => {
    if (typeof ENV_NAME === 'string' && ENV_NAME !== '') {
        return process.env[ENV_NAME] !== undefined ? process.env[ENV_NAME] : defaultValue;
    } else {
        return null;
    }
}

only = (obj, keys) => {
    let newObj = {};
    keys.forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

ucFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};


getFutureDate = (addTime = 60) => {
    if (addTime == 'never') {
        return '9999-12-31 23:59:59';
    } else {
        return Carbon.addDays(addTime).getDateTime();
    }
};

log = (value, destination, text = "") => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    const dirPath = path.join(__dirname, '..', '..', '..', 'tmp');
    const logPath = path.join(dirPath, `${destination}.log`);
    const timestamp = Carbon.getDateTime();

    const logMessage = `${timestamp} ${text}\n${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}\n\n`;

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '', 'utf8');
    }

    fs.appendFileSync(logPath, logMessage, 'utf8');
};

config = (finder) => {
    return Configure.read(finder);
};

base_path = () => {
    return path.join(__dirname, '..', '..', '..');
}

resources_path = () => {
    return `${base_path()}/resources`;
}

view_path = () => {
    return `${base_path()}/resources/views`;
}

public_path = () => {
    return `${base_path()}/public`;
}
database_path = () => {
    return `${base_path()}/main/database`;
}
app_path = () => {
    return `${base_path()}/app`;
}
stub_path = () => {
    return `${base_path()}/main/express/stubs`;
}

generateTableNames = (entity) => {
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

base64_decode = (str) => Buffer.from(str, 'base64').toString('utf-8');

base64_encode = (str) => Buffer.from(str, 'utf-8').toString('base64');

base64_encode_safe = function (str) {
    return Buffer.from(str)
        .toString('base64')        // Standard Base64 encode
        .replace(/\+/g, '-')       // Replace `+` with `-`
        .replace(/\//g, '_')       // Replace `/` with `_`
        .replace(/=+$/, '');       // Remove any trailing `=` padding
}

base64_decode_safe = function (str) {
    // Add necessary padding if missing
    const padding = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return Buffer.from(base64, 'base64').toString('utf8');
}

strtotime = function (str) {
    const timeZone = config('app.timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const now = new Date();
    const adjustedNow = new Date(now.toLocaleString('en-US', { timeZone }));

    // Trim whitespace and convert to lowercase for better matching
    str = str.trim().toLowerCase();

    // Check if the input is a valid date format
    if (Date.parse(str)) {
        return new Date(str).getTime() / 1000;  // Return Unix timestamp in seconds
    }

    // Handle relative date formats like "next Friday", "3 days ago", "last month"
    const regexPatterns = {
        next: /^next\s+(.+)/,
        last: /^last\s+(.+)/,
        ago: /(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago$/,
        specificTime: /(\d{4}-\d{2}-\d{2})|(\d{2}:\d{2}(:\d{2})?)/, // Matches 'YYYY-MM-DD' or 'HH:mm[:ss]'
    };

    // Handle relative time (e.g., "3 days ago", "2 weeks ago")
    const agoMatch = str.match(regexPatterns.ago);
    if (agoMatch) {
        const num = parseInt(agoMatch[1]);
        const unit = agoMatch[2];

        const timeUnits = {
            second: 1000,
            minute: 60 * 1000,
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            year: 365 * 24 * 60 * 60 * 1000,
        };

        const timeToSubtract = num * timeUnits[unit];
        return (adjustedNow.getTime() - timeToSubtract) / 1000;  // Return Unix timestamp in seconds
    }

    // Handle "next" or "last" keyword (e.g., "next Friday", "last month")
    const nextMatch = str.match(regexPatterns.next);
    if (nextMatch) {
        const dayOfWeek = nextMatch[1].trim();
        return getRelativeDay(dayOfWeek, 'next', timeZone);
    }

    const lastMatch = str.match(regexPatterns.last);
    if (lastMatch) {
        const dayOfWeek = lastMatch[1].trim();
        return getRelativeDay(dayOfWeek, 'last', timeZone);
    }

    // Handle specific date/time format (e.g., "2025-01-21" or "14:30")
    const specificTimeMatch = str.match(regexPatterns.specificTime);
    if (specificTimeMatch) {
        return new Date(str).getTime() / 1000;  // Return Unix timestamp in seconds
    }

    // If unable to parse, return null or invalid date
    return null;
};

/**
 * Helper function to get the timestamp for a relative "next" or "last" weekday, considering the time zone.
*/
function getRelativeDay(dayOfWeek, direction, timeZone) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const adjustedToday = new Date(today.toLocaleString('en-US', { timeZone }));

    const currentDay = adjustedToday.getDay();
    const targetDay = days.indexOf(dayOfWeek.toLowerCase());

    if (targetDay === -1) return null; // Invalid weekday

    let diff = targetDay - currentDay;

    if (direction === 'next') {
        if (diff <= 0) diff += 7;
    } else if (direction === 'last') {
        if (diff >= 0) diff -= 7;
    }

    adjustedToday.setDate(adjustedToday.getDate() + diff);
    return adjustedToday.getTime() / 1000;  // Return Unix timestamp in seconds
}

NOW = currentTime = () => {
    return Carbon.getDateTime();
}

date = DATE = (format, unixTimestamp = null) => {
    if (unixTimestamp !== null) {
        return Carbon.getByUnixTimestamp(unixTimestamp, format);
    }
    return Carbon.getByFormat(format);
};

function_exists = (variable) => {
    if (typeof variable === 'undefined') return false;
    return typeof variable === 'function';
}