import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class ExpressView {
    static #viewEngine;
    #data;
    static #engine;
    #rendered;
    constructor(data = {}) {
        this.#data = data;
    }

    static async init() {
        const enginePath = path.resolve(fileURLToPath(import.meta.url), 'node_modules', ExpressView.#engine);

        // Dynamically import the engine module
        const viewEngineModule = await import(enginePath);

        // Assign the default export of the module to #viewEngine
        ExpressView.#viewEngine = viewEngineModule.default || viewEngineModule;
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