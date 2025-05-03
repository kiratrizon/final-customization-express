import fs from "fs";

class ExpressResponse {
    #defaultStatusCode = 200;
    #returnStatusCode;
    #headers = {};
    #returnData = {};
    constructor(html = null) {
        if (isset(html) && html) {
            this.#returnData['html'] = html;
        }
    }
    json(data, statusCode = this.#defaultStatusCode) {
        try {
            this.#responseValidator('json');
            this.#returnData['json'] = data;
            this.#returnStatusCode = statusCode;
            return this;
        } catch (error) {
            // Handle errors by returning a generic response
            this.#returnData['error'] = error.message;
            this.#returnStatusCode = 400; // You can adjust the status code as needed
            return this;
        }
    }
    header(key, value) {
        if (typeof key !== 'string') {
            throw new Error('Header key must be a string');
        }
        this.#headers[key] = value;
        return this;
    }
    html(content, statusCode = this.#defaultStatusCode) {
        try {
            this.#responseValidator('html');
            this.#returnData['html'] = content;
            this.#returnStatusCode = statusCode;
            return this;
        } catch (error) {
            // Handle errors by returning a generic response
            this.#returnData['error'] = error.message;
            this.#returnStatusCode = 400; // You can adjust the status code as needed
            return this;
        }
    }
    withHeaders(headers = {}) {
        if (typeof headers !== 'object') {
            throw new Error('Headers must be an object');
        }
        this.#headers = { ...this.#headers, ...headers };
        return this;
    }
    accessData() {
        let returnType;

        const keys = Object.keys(this.#returnData);
        keys.forEach((key) => {
            if (key_exist(this.#returnData, key) && !isset(returnType)) {
                returnType = key;
            }
        });
        if (!isset(returnType)) {
            throw new Error('No response type set');
        }
        return {
            ...this.#returnData,
            headers: this.#headers,
            statusCode: this.#returnStatusCode,
            returnType: returnType
        }
    }

    file(filePath, statusCode = this.#defaultStatusCode) {
        try {
            this.#responseValidator('file');
            this.#returnData['file'] = filePath;
            this.#returnStatusCode = statusCode;
            return this;
        } catch (error) {
            // Handle errors by returning a generic response
            this.#returnData['error'] = error.message;
            this.#returnStatusCode = 400; // You can adjust the status code as needed
            return this;
        }
    }

    #responseValidator(insertType = 'html') {
        let returnTypes = ['html', 'json', 'file', 'download'];
        // splice the insertType from returnTypes
        returnTypes.splice(returnTypes.indexOf(insertType), 1);
        let countErrors = 0;
        returnTypes.forEach((type) => {
            if (key_exist(this.#returnData, type)) {
                countErrors++;
            }
        });
        if (countErrors > 0) {
            throw new Error(`Cannot set ${insertType} response after ${returnTypes.join(', ')} response`);
        }
    }

    download(filePath, statusCode = this.#defaultStatusCode) {
        try {
            this.#responseValidator('download');

            let downloadPayload;

            if (is_string(filePath)) {
                if (this.#filePathValidator(filePath)) {
                    console.error(`Invalid file path: ${filePath}`);
                }
                downloadPayload = [filePath];
            } else if (is_array(filePath) && filePath.length === 2) {
                const [path, name] = filePath;
                if (this.#filePathValidator(path)) {
                    console.error(`Invalid file path: ${path}`);
                }
                if (!is_string(name)) {
                    console.error('Download name must be a string');
                }
                downloadPayload = [path, name];
            } else {
                console.error('Invalid argument: must be a string or [filePath, downloadName]');
            }

            this.#returnData['download'] = downloadPayload;
            this.#returnStatusCode = statusCode;
            return this;
        } catch (error) {
            // Handle errors by returning a generic response
            this.#returnData['error'] = error.message;
            this.#returnStatusCode = 400; // You can adjust the status code as needed
            return this;
        }
    }

    #filePathValidator(filePath) {
        if (typeof filePath !== 'string') {
            throw new Error('File path must be a string');
        }
        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist');
        }
        if (!fs.statSync(filePath).isFile()) {
            throw new Error('File is not a regular file');
        }
        if (fs.statSync(filePath).isDirectory()) {
            throw new Error('File is a directory');
        }
        if (fs.statSync(filePath).isSymbolicLink()) {
            throw new Error('File is a symbolic link');
        }
        if (fs.statSync(filePath).isBlockDevice()) {
            throw new Error('File is a block device');
        }
        return false;
    }

    streamDownload(callback, fileName, statusCode = this.#defaultStatusCode) {
        try {
            this.#responseValidator('streamDownload');
            if (!is_function(callback)) {
                throw new Error('Callback must be a function');
            }
            if (!is_string(fileName)) {
                throw new Error('File name must be a string');
            }
            this.#returnData['streamDownload'] = [callback, fileName];
            this.#returnStatusCode = statusCode;
            return this;
        } catch (error) {
            // Handle errors by returning a generic response
            this.#returnData['error'] = error.message;
            this.#returnStatusCode = 400; // You can adjust the status code as needed
            return this;
        }
    }
}

export default ExpressResponse;