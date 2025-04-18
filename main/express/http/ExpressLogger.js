const Carbon = require("../../../libraries/Materials/Carbon");
const path = require("path");
const fs = require("fs");

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

        console.log(logMessage);
        if (env("NODE_ENV") === "production") {
            return;
        }

        fs.appendFileSync(logPath, logMessage, "utf8");
    }
}

module.exports = Logger;