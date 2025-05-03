import DB from "../../main/database/Manager/DB.mjs";


class Validator {
    #validRules = [
        'required',
        'email',
        'min',
        'max',
        'unique',
        'confirmed'
    ];

    static async make(data = {}, $validations = {}) {
        const validate = new Validator(data, $validations);
        await validate.startValidate();
        return validate;
    }

    #data;
    #errors = {};
    #validations;
    constructor(data = {}, $validations = {}) {
        this.#data = data;
        this.#validations = $validations;
    }

    async startValidate() {
        await this.#handle();
        return this;
    }

    getErrors() {
        // filter out empty errors
        const filteredErrors = Object.fromEntries(
            Object.entries(this.#errors).filter(([key, value]) => value.length > 0)
        );
        return filteredErrors;
    }

    async #handle() {
        let keysToValidate = Object.keys(this.#validations);
        for (const key of keysToValidate) {
            this.#errors[key] = [];
            let rules = this.#validations[key].split('|');
            for (const rule of rules) {
                let [ruleName, ruleValue] = rule.split(':');
                await this.#validate(key, ruleName, ruleValue);
            }
        }
    }

    async #validate(key, ruleName, ruleValue = undefined) {
        let returnData = true;

        if (!this.#validRules.includes(ruleName)) {
            return;
        }

        switch (ruleName) {
            case 'required':
                if (!isset(this.#data[key]) || empty(this.#data[key])) {
                    this.#errors[key].push('This field is required.');
                    returnData = false;
                }
                break;
            case 'email':
                if (!this.#data[key].match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    this.#errors[key].push('Invalid email format.');
                    returnData = false;
                }
                break;
            case 'min':
                if (this.#data[key].length < parseInt(ruleValue)) {
                    this.#errors[key].push(`Minimum length is ${ruleValue}.`);
                    returnData = false;
                }
                break;
            case 'max':
                if (this.#data[key].length > parseInt(ruleValue)) {
                    this.#errors[key].push(`Maximum length is ${ruleValue}.`);
                    returnData = false;
                }
                break;
            case 'unique':
                // Implement unique validation logic
                if (isset(ruleValue)) {
                    const [table, column] = ruleValue.split(',');
                    const isUnique = await this.#checkUnique(key, table, column);
                    if (!isUnique) {
                        this.#errors[key].push(`The ${key} must be unique.`);
                        returnData = false;
                    }
                }
                break;
            case 'confirmed':
                if (this.#data[key] !== this.#data[`${key}_confirmation`]) {
                    this.#errors[key].push('Confirmation does not match.');
                    returnData = false;
                }
                break;
            default:
                break;
        }

        return returnData;
    }

    async #checkUnique(key, table, column) {
        const value = this.#data[key];
        return !(await DB.table(table).where(column, value).first());
    }

    fails() {
        let count = 0;
        Object.keys(this.#errors).forEach((key) => {
            if (this.#errors[key].length > 0) {
                count++;
            }
        });
        return count > 0;
    }
}

export default Validator;