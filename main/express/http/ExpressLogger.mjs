import path from "path";


class Logger {
    static log(value, destination, text = "") {
        const dirPath = path.join(tmpPath(), "logs");
        const logPath = path.join(dirPath, `${destination}.log`);
        const timestamp = date('Y-m-d H:i:s');

        const logMessage = `${timestamp} ${text}\n${typeof value === "object" ? JSON.stringify(value, null, 2) : value
            }\n\n`;
        if (!pathExist(dirPath)) {
            makeDir(dirPath);
        }

        if (!pathExist(logPath)) {
            // init write
            writeFile(logPath, "");
        }
        if (IN_PRODUCTION) {
            console.log(logMessage);
            return;
        }

        appendFile(logPath, logMessage);
    }
}

export default Logger;