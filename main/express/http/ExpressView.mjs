import fs from 'fs';
import path from 'path';

class ExpressView {
    static #viewEngine;
    #data;
    static #engine;
    #rendered;
    constructor(data = {}) {
        this.#data = data;
    }

    static async init() {
        const engine = (await config('view.defaultViewEngine')) || 'ejs';
        ExpressView.#engine = engine;
        const viewEngine = await import(ExpressView.#engine);
        ExpressView.#viewEngine = viewEngine.default;
    }

    element(viewName, data = {}) {
        this.#data = {
            ...data,
            ...this.#data
        };

        const templatePath = path.join(view_path(), `${viewName.split('.').join('/')}.${ExpressView.#engine}`);
        if (!fs.existsSync(templatePath)) {
            throw `View file not found: ${templatePath}`;
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