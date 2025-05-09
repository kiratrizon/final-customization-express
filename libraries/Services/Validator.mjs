import DB from "../../main/database/Manager/DB.mjs";

class Validator {
    #validRules = ['required', 'email', 'min', 'max', 'unique', 'confirmed', 'regex'];
    #regex = {
        digit: '\\d+',
        alpha: '[a-zA-Z]+',
        alphanumeric: '[a-zA-Z0-9]+',
        alphanumericspecial: '^[a-zA-Z0-9@#\\$%\\-_\\.!\\*]+$',
        slug: '[a-z0-9-]+',
        uuid: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    };

    static async make(data = {}, validations = {}) {
        const v = new Validator(data, validations);
        await v.#validateAll();
        return v;
    }

    #data; #errors = {}; #validations;
    constructor(data, validations) {
        this.#data = data;
        this.#validations = validations;
    }

    getErrors() {
        return Object.fromEntries(Object.entries(this.#errors).filter(([_, v]) => v.length));
    }

    fails() {
        return Object.values(this.#errors).some(arr => arr.length > 0);
    }

    async #validateAll() {
        for (const [key, ruleStr] of Object.entries(this.#validations)) {
            this.#errors[key] = [];
            for (const rule of ruleStr.split('|')) {
                const [name, val] = rule.split(':');
                if (!this.#validRules.includes(name)) throw new Error(`Validation rule ${name} is not supported.`);
                await this.#applyRule(key, name, val)
            }
        }
    }

    async #applyRule(key, name, val) {
        const v = this.#data[key];
        const e = this.#errors[key];

        switch (name) {
            case 'required': if (!isset(v) || empty(v)) e.push('This field is required.'); break;
            case 'email': if (!v?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.push('Invalid email format.'); break;
            case 'min': if (!v || v.length < +val) e.push(`Minimum length is ${val}.`); break;
            case 'max': if (!v || v.length > +val) e.push(`Maximum length is ${val}.`); break;
            case 'unique': {
                const [table, column] = val.split(',');
                const exists = await DB.table(table).where(column, v).first();
                if (exists) e.push(`The ${key} must be unique.`);
                break;
            }
            case 'confirmed': if (v !== this.#data[`${key}_confirmation`]) e.push('Confirmation does not match.'); break;
            case 'regex': {
                const pattern = this.#regex[val];
                if (!pattern) e.push(`Regex ${val} is not defined.`);
                else if (!v?.match(new RegExp(pattern))) e.push(`Invalid format for ${key}.`);
                break;
            }
        }
    }
}

export default Validator;
