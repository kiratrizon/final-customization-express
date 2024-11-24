const fs = require('fs');
const path = require('path');
const Configure = require('./Configure');
require('dotenv').config();

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
        return global.formatDate(futureDate);
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
