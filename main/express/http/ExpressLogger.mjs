import path from "path";
import fs from "fs";


class Logger {
    static log(value, destination, text = "") {
        const dirPath = path.join(tmp_path(), "logs");
        const logPath = path.join(dirPath, `${destination}.log`);
        const timestamp = date();

        const logMessage = `${timestamp} ${text}\n${typeof value === "object" ? JSON.stringify(value, null, 2) : value
            }\n\n`;
        if (env("NODE_ENV") === "production") {
            console.log(logMessage);
            return;
        }
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        if (!fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, "", "utf8");
        }

        fs.appendFileSync(logPath, logMessage, "utf8");
    }
}

export default Logger;