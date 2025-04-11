class ExpressResponse {
    #defaultStatusCode = 200;
    #html;
    #returnStatusCode;
    #json;
    #headers = {};
    constructor(html = null){
        this.#html = html;
    }
    json(data, statusCode = this.#defaultStatusCode){
        if (typeof statusCode !== 'number') {
            throw new Error('Status code must be a number');
        }
        if (this.#html){
            throw new Error('Cannot set JSON response after HTML response');
        }
        this.#json = data;
        this.#returnStatusCode = statusCode;
        this.#headers['Content-Type'] = 'application/json';
        return this;
    }
    header(key, value){
        if (typeof key !== 'string') {
            throw new Error('Header key must be a string');
        }
        if (this.#html){
            throw new Error('Cannot set headers after HTML response');
        }
        this.#headers[key] = value;
        return this;
    }
    html(content, statusCode = this.#defaultStatusCode) {
        if (this.#json) {
            throw new Error('Cannot set HTML response after JSON response');
        }
        this.#html = content;
        this.#returnStatusCode = statusCode;
        this.#headers['Content-Type'] = 'text/html';
        return this;
    }
    accessData(){
        // define return type whether it is html or json
        let returnType = '';
        if (this.#html) {
            returnType = 'html';
        } else if (this.#json) {
            returnType = 'json';
        } else {
            throw new Error('No response set');
        }
        
        return {
            html: this.#html,
            json: this.#json,
            headers: this.#headers,
            statusCode: this.#returnStatusCode,
            returnType: returnType
        }
    }
}

module.exports = ExpressResponse;