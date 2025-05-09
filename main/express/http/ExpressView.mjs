import ejs from 'ejs';
import pug from 'pug';

class ExpressView {
    static #viewEngine;
    #data;
    static #engine = 'ejs';
    rendered = '';
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

        let templatePath = viewPath(`${viewName.split('.').join('/')}.${ExpressView.#engine}`);
        if (!pathExist(templatePath)) {
            const error = `View not found: ${templatePath}`;
            this.rendered = error;
            return error;
        }
        const rawHtml = getFileContents(templatePath)
        const rendered = ExpressView.#viewEngine.render(rawHtml, this.#data);
        this.rendered = rendered;
        return rendered;
    }
}

export default ExpressView;