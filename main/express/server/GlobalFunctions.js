const fs = require('fs');
const path = require('path');
const Configure = require('../../../libraries/Materials/Configure');
const Carbon = require('../../../libraries/Materials/Carbon');
require('dotenv').config();

global.env = (ENV_NAME, defaultValue = null) => {
    if (typeof ENV_NAME === 'string' && ENV_NAME !== '') {
        return process.env[ENV_NAME] !== undefined ? process.env[ENV_NAME] : defaultValue;
    } else {
        return null;
    }
}

global.only = (obj, keys) => {
    let newObj = {};
    keys.forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

global.ucFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

global.formatTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

global.formatDate = (date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

global.getFutureDate = (addTime = 60) => {
    if (addTime == 'never') {
        return '9999-12-31 23:59:59';
    } else {
        const now = new Date();
        const futureDate = new Date(now.getTime() + addTime * 24 * 60 * 60 * 1000);
        return formatDate(futureDate);
    }
};

global.log = (value, destination, text = "") => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    const dirPath = path.join(__dirname, '..', '..', '..', 'tmp');
    const logPath = path.join(dirPath, `${destination}.log`);
    const timestamp = global.formatTimestamp();

    const logMessage = `${timestamp} ${text}\n${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}\n\n`;

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '', 'utf8');
    }

    fs.appendFileSync(logPath, logMessage, 'utf8');
};

global.config = (finder) => {
    return Configure.read(finder);
};

global.base_path = () => {
    return path.join(__dirname, '..', '..', '..');
}

global.resources_path = () => {
    return `${base_path()}/resources`;
}

global.view_path = () => {
    return `${base_path()}/resources/views`;
}

global.public_path = () => {
    return `${base_path()}/public`;
}

global.database_path = () => {
    return `${base_path()}/main/database`;
}

global.app_path = () => {
    return `${base_path()}/app`;
}

global.stub_path = () => {
    return `${base_path()}/main/express/stubs`;
}

global.generateTableNames = (entity) => {
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

global.base64_encode = function (str) {
    return Buffer.from(str)
        .toString('base64')        // Standard Base64 encode
        .replace(/\+/g, '-')       // Replace `+` with `-`
        .replace(/\//g, '_')       // Replace `/` with `_`
        .replace(/=+$/, '');       // Remove any trailing `=` padding
}

global.base64_decode = function (str) {
    // Add necessary padding if missing
    const padding = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return Buffer.from(base64, 'base64').toString('utf8');
}

global.NOW = () => {
    return Carbon.getDateTime();
}

global.DATETIME = (format, params = false) => {
    // if (typeof params === 'string') {
    //     Carbon.adjustTime(params);
    // }
    return Carbon.getByFormat(format);
}

global.function_exists = (variable) => {
    if (typeof variable === 'undefined') return false;
    return typeof variable === 'function';
}