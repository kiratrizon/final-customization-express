Object.defineProperty(globalThis, 'functionDesigner', {
    value: (key, value) => {
        if (key in globalThis) {
            return;
        }
        if (typeof value !== 'function') {
            throw new Error(`The value for "${key}" must be a function.`);
        }
        Object.defineProperty(globalThis, key, {
            value: value,
            writable: false,
            configurable: false,
        });
    },
    writable: false,
    configurable: false,
});