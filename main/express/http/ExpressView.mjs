import ejs from 'ejs';
import pug from 'pug';

class ExpressView {
    static #viewEngine;
    #data;
    static #engine;
    #rendered;
    #viewName;
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
        this.#viewName = viewName;
    }

    getRendered() {
        return {
            html_data: this.#viewName,
            object_data: this.#data
        }
    }
}

export default ExpressView;