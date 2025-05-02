class ExpressRegexHandler {
    #regex = {
        digit: '\\d+',              // only digits
        alpha: '[a-zA-Z]+',         // only letters
        alphanumeric: '[a-zA-Z0-9]+', // letters and numbers
        slug: '[a-z0-9-]+',         // slug-style (lowercase, numbers, hyphens)
        uuid: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' // UUID
    };
    constructor(config = {}) {
        this.config = config;
    }

    applyRegex() {
        return (req, res, next) => {
            const params = req.params;
            const configKeys = Object.keys(this.config);
            const errors = [];
            configKeys.forEach((key) => {
                if (key in params) {
                    const regex = this.#getRegex(this.config[key]);
                    if (regex) {
                        const regexPattern = new RegExp(`^${regex}$`);
                        if (!regexPattern.test(params[key])) {
                            errors.push({
                                key: key,
                                message: `Invalid value for ${key}. Expected format: (${regex})`
                            });
                        }
                    }
                }
            });
            if (res.headersSent) {
                return;
            }
            if (errors.length) {
                if (isRequest()) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(422).json({
                        message: 'Validation error',
                        errors: errors
                    });
                } else {
                    res.setHeader('Content-Type', 'text/html');
                    res.status(422).send({
                        message: 'Validation error',
                        errors: errors
                    });
                }
                return;
            }
            next();
        }
    }

    #getRegex(regex) {
        if (regex in this.#regex) {
            return this.#regex[regex];
        }
        return null;
    }
}

export default ExpressRegexHandler;