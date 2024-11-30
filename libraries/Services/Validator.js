const validRules = [
    'required',
    'email',
    'min',
    'max',
    'unique',
    'confirmed',
    'exists'
];

const Database = require('../../main/database/Database');

class Validator {
    static params;
    static #data;
    static errors;
    static validRules = validRules;
    static old;
    static uniques = [];
    static #database = new Database();

    // Handle the validation for each field
    static async #handle() {
        let keysToValidate = Object.keys(this.params);
        for (const key of keysToValidate) {
            let rules = this.params[key].split('|');
            for (const rule of rules) {
                let [ruleName, ruleValue] = rule.split(':');
                const isValid = await this.#validate(key, ruleName, ruleValue);
                if (!isValid) {
                    break;
                }
            }
        }
    }

    // Initialize errors and old values
    static #initialize() {
        this.errors = {};
        this.old = {};
        this.#data = undefined;
    }

    // Validate a field based on its rules
    static async #validate(key, ruleName, ruleValue = undefined) {
        let returnData = true;

        switch (ruleName) {
            case 'required':
                if (!this.#data[key] || this.#data[key] === '') {
                    this.errors[key] = 'This field is required.';
                    returnData = false;
                }
                break;
            case 'email':
                if (!this.#validateEmail(this.#data[key])) {
                    this.errors[key] = 'Invalid email address.';
                    returnData = false;
                }
                break;
            case 'min':
                if (this.#data[key].length < Number(ruleValue)) {
                    this.errors[key] = `This field must be at least ${ruleValue} characters.`;
                    returnData = false;
                }
                break;
            case 'max':
                if (this.#data[key].length > Number(ruleValue)) {
                    this.errors[key] = `This field must be at most ${ruleValue} characters.`;
                    returnData = false;
                }
                break;
            case 'unique':
                const isUnique = await this.#validateUnique(this.#data[key], ruleValue, key);
                if (!isUnique) {
                    this.errors[key] = `The ${key} already used.`;
                    returnData = false;
                }
                break;
            case 'confirmed':
                if (this.#data[`${key}_confirmation`] !== this.#data[key]) {
                    this.errors[key] = 'This field must match the confirmation field.';
                    returnData = false;
                }
                break;
            case 'exists':
                const isNotExist = await this.#validateExists(this.#data[key], ruleValue);
                if (!isNotExist) {
                    this.errors[key] = 'This value exists.';
                    returnData = false;
                }
                break;
            default:
                break;
        }

        return returnData;
    }

    // Validate email format
    static #validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    // Check if the value is unique in the database
    static async #validateUnique(value, table, key) {
        let sql = `SELECT ${key} FROM ${table} WHERE ${key} = ?`;
        let data = await this.#database.runQuery(sql, [value]);
        return data.length === 0;
    }

    // Check if the value exists in the database
    static async #validateExists(value, table) {
        let keys = Object.keys(value);
        let sql = `SELECT id FROM ${table} WHERE `;
        let params = [];
        let values = [];
        keys.forEach(key => {
            params.push(`${key} = ?`);
            values.push(value[key]);
        });
        sql += params.join(' AND ');
        let data = await this.#database.runQuery(sql, values);
        return data.length === 0;
    }

    // Checks if there are any validation errors
    static fails() {
        return (Object.keys(this.errors).length > 0);
    }

    // Revoke all errors and old data
    static revoke() {
        this.errors = {};
        this.old = {};
    }

    // Initialize the validator with data and parameters
    static async make(data = {}, params = {}) {
        this.#initialize();
        this.params = params;
        this.#data = data;
        await this.#handle();
        let returnData = (Object.keys(this.errors).length > 0);
        if (returnData) {
            let returnKeys = {};
            Object.keys(this.#data).forEach(key => {
                if (this.#data[key] !== '' && this.#data[key] !== null && typeof this.#data[key] !== 'undefined' && this.#data[key]) {
                    returnKeys[key] = this.#data[key];
                }
            });
            this.old = returnKeys;
        }
        return this;
    }
}

module.exports = Validator;
