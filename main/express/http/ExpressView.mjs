import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import pug from 'pug';

import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExpressView {
    static #viewEngine;
    #data;
    static #engine = 'ejs';
    #rendered;
    constructor(data = {}) {
        this.#data = data;
    }

    static async init() {
        const engine = await config('view.defaultViewEngine') || 'ejs';
        ExpressView.#engine = engine;
        if (engine === 'ejs') {
            ExpressView.#viewEngine = ejs;
        } else if (engine === 'pug') {
            ExpressView.#viewEngine = pug;
        } else {
            throw `View engine not supported: ${engine}`;
        }
    }

    element(viewName, data = {}) {
        this.#data = {
            ...data,
            ...this.#data
        };

        let templatePath = view_path(`${viewName.split('.').join('/')}.${ExpressView.#engine}`);
        let dynamic = path.join(__dirname, '..', '..', '..', 'resources', 'views', `${viewName.split('.').join('/')}.${ExpressView.#engine}`);
        // return templatePath === dynamic ? 'true' : 'false'
        if (!fs.existsSync(templatePath)) {
            return `View file not found: ${templatePath}`;
        }
        const rawHtml = fs.readFileSync(templatePath, "utf-8")
        const rendered = ExpressView.#viewEngine.render(rawHtml, this.#data);
        return rendered;
    }

    view(rendered) {
        this.#rendered = rendered;
        return this;
    }

    getRendered() {
        if (this.#rendered) {
            return this.#rendered;
        }
        return null;
    }
}

export default ExpressView;