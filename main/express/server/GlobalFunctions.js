const fs = require('fs');
const path = require('path');
const Configure = require('../../../libraries/Materials/Configure');
const NodeMailer = require('../../../vendor/node-mailer');
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
    const dirPath = path.join(__dirname, '..', '..', 'tmp');
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

global.Mailer = NodeMailer;

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


global.renderData = (data, shouldExit = false, res) => {
    const tailwindStyles = `
        <style>
            div.debug { font-family: sans-serif; padding: 2rem; background-color: #f7fafc; }
            pre { background-color: #000030; padding: 1rem; border-radius: 0.5rem; }
            .data-type-wrapper {
                display: inline-block;
                max-width: 100%;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                white-space: pre-wrap;
            }
            .scrollable {
                max-width: 100%;
                overflow-x: auto;
            }
            .string { color: #48bb78; } /* Green for strings */
            .number { color: #ed8936; } /* Orange for numbers */
            .boolean { color: #3182ce; } /* Blue for booleans */
            .object-key { color: #a0aec0; font-weight: bold; } /* Gray for object keys */
            .object-value { color: #2d3748; }
            .array { color: #805ad5; } /* Purple for arrays */
            .null { color: #9b2c2c; } /* Red for null */
            .undefined { color: #ed8936; } /* Orange for undefined */
            .indentation { padding-left: 20px; }
        </style>
    `;

    const recursiveRender = (value, level = 0) => {
        const indentClass = `indentation level-${level}`;
        if (Array.isArray(value)) {
            return `<div class="array scrollable ${indentClass}">${value.map(item => `<div>${recursiveRender(item, level + 1)}</div>`).join('')}</div>`;
        } else if (value === null) {
            return `<div class="null ${indentClass}">null</div>`;
        } else if (typeof value === 'object') {
            return `<div class="object scrollable ${indentClass}">${Object.entries(value).map(([key, val]) =>
                `<div><span class="object-key">${key}:</span> <span class="object-value">${recursiveRender(val, level + 1)}</span></div>`
            ).join('')}</div>`;
        } else if (typeof value === 'string') {
            return `<div class="string ${indentClass}">"${value}"</div>`;
        } else if (typeof value === 'number') {
            return `<div class="number ${indentClass}">${value}</div>`;
        } else if (typeof value === 'boolean') {
            return `<div class="boolean ${indentClass}">${value}</div>`;
        } else if (typeof value === 'undefined') {
            return `<div class="undefined ${indentClass}">undefined</div>`;
        }
        return `<div>${value}</div>`;
    };

    const htmlContent = `
        ${tailwindStyles}
        <div class="debug">
            <pre class="data-type-wrapper">${recursiveRender(data)}</pre>
        </div>
    `;

    // Send HTML if shouldExit is false
    if (res) {
        res.set('Content-Type', 'text/html');
        res.send(htmlContent);
    }

    // End response if shouldExit is true
    if (shouldExit) res.end();
};