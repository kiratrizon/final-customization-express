const validRules = [
    'required',
    'email',
    'min',
    'max',
    'unique',
    'confirmed',
    'exists'
];

const Database = require('../../main/database/Manager/DatabaseManager');

class Validator {
    static params;
    static #data;
    static errors;
    static validRules = validRules;
    static old;
    static uniques = [];
    static #database = new Database();

    // Handle the validation for each field
    static #handle() {
        let keysToValidate = Object.keys(Validator.params);
        for (const key of keysToValidate) {
            let rules = Validator.params[key].split('|');
            for (const rule of rules) {
                let [ruleName, ruleValue] = rule.split(':');
                const isValid = Validator.#validate(key, ruleName, ruleValue);
                if (!isValid) {
                    break;
                }
            }
        }
    }

    errors;
    old;
    constructor(errors, old) {
        this.errors = errors;
        this.old = old;
    }

    // Initialize errors and old values
    static #initialize() {
        Validator.errors = {};
        Validator.old = {};
        Validator.#data = undefined;
    }

    // Validate a field based on its rules
    static #validate(key, ruleName, ruleValue = undefined) {
        let returnData = true;

        switch (ruleName) {
            case 'required':
                if (!Validator.#data[key] || Validator.#data[key] === '') {
                    Validator.errors[key] = 'This field is required.';
                    returnData = false;
                }
                break;
            case 'email':
                if (!Validator.#validateEmail(Validator.#data[key])) {
                    Validator.errors[key] = 'Invalid email address.';
                    returnData = false;
                }
                break;
            case 'min':
                if (Validator.#data[key].length < Number(ruleValue)) {
                    Validator.errors[key] = `This field must be at least ${ruleValue} characters.`;
                    returnData = false;
                }
                break;
            case 'max':
                if (Validator.#data[key].length > Number(ruleValue)) {
                    Validator.errors[key] = `This field must be at most ${ruleValue} characters.`;
                    returnData = false;
                }
                break;
            case 'unique':
                const isUnique = Validator.#validateUnique(Validator.#data[key], ruleValue, key);
                if (!isUnique) {
                    Validator.errors[key] = `The ${key} already used.`;
                    returnData = false;
                }
                break;
            case 'confirmed':
                if (Validator.#data[`${key}_confirmation`] !== Validator.#data[key]) {
                    Validator.errors[key] = 'This field must match the confirmation field.';
                    returnData = false;
                }
                break;
            case 'exists':
                const isNotExist = Validator.#validateExists(Validator.#data[key], ruleValue);
                if (!isNotExist) {
                    Validator.errors[key] = 'This value exists.';
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
    static #validateUnique(value, table, key) {
        let sql = `SELECT ${key} FROM ${table} WHERE ${key} = ?`;
        let data = Validator.#database.runQuery(sql, [value]);
        return data.length === 0;
    }

    // Check if the value exists in the database
    static #validateExists(value, table) {
        let keys = Object.keys(value);
        let sql = `SELECT id FROM ${table} WHERE `;
        let params = [];
        let values = [];
        keys.forEach(key => {
            params.push(`${key} = ?`);
            values.push(value[key]);
        });
        sql += params.join(' AND ');
        let data = Validator.#database.runQuery(sql, values);
        return data.length === 0;
    }

    // Checks if there are any validation errors
    fails() {
        return (Object.keys(this.errors).length > 0);
    }

    // Initialize the validator with data and parameters
    static make(data = {}, params = {}) {
        Validator.#initialize();
        Validator.params = params;
        Validator.#data = data;
        Validator.#handle();
        let returnData = (Object.keys(Validator.errors).length > 0);
        if (returnData) {
            let returnKeys = {};
            Object.keys(Validator.#data).forEach(key => {
                if (Validator.#data[key] !== '' && Validator.#data[key] !== null && typeof Validator.#data[key] !== 'undefined' && Validator.#data[key]) {
                    returnKeys[key] = Validator.#data[key];
                }
            });
            Validator.old = returnKeys;
        }
        let validatorInstantiated = new Validator(Validator.errors, Validator.old);
        Validator.#initialize();
        return validatorInstantiated;
    }
}

module.exports = Validator;
