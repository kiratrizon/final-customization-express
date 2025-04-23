const fs = require('fs');
const path = require('path');

class ExpressView {
    #viewEngine;
    #data;
    #engine;
    constructor(data = {}) {
        const engine = config('view.defaultViewEngine') || 'ejs';
        this.#engine = engine;
        this.#viewEngine = require(`${engine}`);
        this.#data = data;
    }

    element(viewName, data = {}) {
        this.#data = {
            ...data,
            ...this.#data
        };

        const templatePath = path.join(view_path(), `${viewName.split('.').join('/')}.${this.#engine}`);
        if (!fs.existsSync(templatePath)) {
            throw `View file not found: ${templatePath}`;
        }
        const rawHtml = fs.readFileSync(templatePath, "utf-8")
        const rendered = this.#viewEngine.render(rawHtml, this.#data);
        return rendered;

    }
}

module.exports = ExpressView;