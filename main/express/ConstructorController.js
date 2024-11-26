class ConstructorController {
    init(request) {
        global.request = request;
        global.dd = (data) => this.#renderData(data, true);
        global.dump = (data) => this.#renderData(data, false);
    }

    #renderData(data, shouldExit = false) {
        const acceptHeader = req.headers['accept'];

        if (acceptHeader && acceptHeader.includes('application/json')) {
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(data, null, 2));
        } else {
            const tailwindScript = `<script src="/global_assets/tailwind.js"></script>`;
            const tailwindStyles = `
                <style>
                    div.debug { font-family: sans-serif; padding: 2rem; background-color: #f7fafc; }
                    pre { background-color: #000030; padding: 1rem; border-radius: 0.5rem; }
                    .data-type-wrapper {
                        display: inline-block;
                        max-width: 100%;
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                        word-break: break-word;
                        white-space: pre-wrap;
                    }
                    .scrollable {
                        max-width: 100%;
                        overflow-x: auto;
                    }
                    .string { color: #48bb78; } /* Green for strings */
                    .number { color: #ed8936; } /* Orange for numbers */
                    .boolean { color: #3182ce; } /* Blue for booleans */
                    .object-key { color: #a0aec0; font-weight: bold; } /* Gray for object keys */
                    .object-value { color: #2d3748; }
                    .array { color: #805ad5; } /* Purple for arrays */
                    .null { color: #9b2c2c; } /* Red for null */
                    .undefined { color: #ed8936; } /* Orange for undefined */
                    .indentation { padding-left: 20px; }
                </style>
            `;

            const recursiveRender = (value, level = 0) => {
                const indentClass = `indentation level-${level}`;
                if (Array.isArray(value)) {
                    return `<div class="array scrollable ${indentClass}">${value.map(item => `<div>${recursiveRender(item, level + 1)}</div>`).join('')}</div>`;
                } else if (value === null) {
                    return `<div class="null ${indentClass}">null</div>`;
                } else if (typeof value === 'object') {
                    return `<div class="object scrollable ${indentClass}">${Object.entries(value).map(([key, val]) => 
                        `<div><span class="object-key">${key}:</span> <span class="object-value">${recursiveRender(val, level + 1)}</span></div>`
                    ).join('')}</div>`;
                } else if (typeof value === 'string') {
                    return `<div class="string ${indentClass}">"${value}"</div>`;
                } else if (typeof value === 'number') {
                    return `<div class="number ${indentClass}">${value}</div>`;
                } else if (typeof value === 'boolean') {
                    return `<div class="boolean ${indentClass}">${value}</div>`;
                } else if (typeof value === 'undefined') {
                    return `<div class="undefined ${indentClass}">undefined</div>`;
                }
                return `<div>${value}</div>`;
            };

            const htmlContent = `
                ${tailwindScript}
                ${tailwindStyles}
                <div class="debug">
                    <pre class="data-type-wrapper">${recursiveRender(data)}</pre>
                </div>
            `;
            res.set('Content-Type', 'text/html');
            res.send(htmlContent);
        }

        if (shouldExit) res.end();
    }
}

module.exports = ConstructorController;