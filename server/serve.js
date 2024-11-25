const webRoute = require('../Routes/web');
const apiRoute = require('../Routes/api');
const path = require('path');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const morgan = require('morgan');
require('dotenv').config();
require('../libraries/Materials/GlobalFunctions');
class Server {
    static express = require('express');
    static app = Server.express();

    static validateRoute(args1, args2 = undefined) {
        let route;
        let prefix = "";
        if (args2 === undefined) {
            route = args1;
        } else {
            prefix = args1;
            route = args2;
        }
        if (
            !route ||
            typeof route.mainRouter !== 'function' ||
            typeof route.mainRouter.stack !== 'object' ||
            !Array.isArray(route.mainRouter.stack)
        ) {
            return;
        }
        Server.app.use(prefix, route.mainRouter);
    }
    static boot() {
        Server.app.use(morgan('dev'));
        Server.app.use(Server.express.json());
        Server.app.use(Server.express.urlencoded({ extended: true }));
        Server.app.use(Server.express.static(path.join(__dirname, '..', 'public')));
        const handleBoot = Server.handle();
        Object.keys(handleBoot).forEach((key) => {
            Server.app.use(handleBoot[key]);
        });

        global.dd = (data) => {
            const acceptHeader = req.headers['accept'];
        
            // Check if it's a JSON request
            if (acceptHeader && acceptHeader.includes('application/json')) {
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(data, null, 2)); // Raw JSON with indentation
            } else {
                // Tailwind CSS for rendering
                const tailwindScript = `
                    <script src="/global_assets/tailwind.js"></script>
                `;
        
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
                            white-space: pre-wrap; /* Allow text to wrap */
                        }
        
                        .scrollable {
                            max-width: 100%;
                            overflow-x: auto; /* Enable horizontal scroll when necessary */
                        }
        
                        /* Tailwind utility classes for color based on data type */
                        .string { color: #48bb78; } /* Green for strings */
                        .number { color: #ed8936; } /* Orange for numbers */
                        .boolean { color: #3182ce; } /* Blue for booleans */
                        .object-key { color: #a0aec0; font-weight: bold; } /* Gray for object keys */
                        .object-value { color: #2d3748; } /* Dark text for object values */
                        .array { color: #805ad5; } /* Purple for arrays */
                        .null { color: #9b2c2c; } /* Red for null */
                        .undefined { color: #ed8936; } /* Orange for undefined */
                        .indentation { padding-left: 20px; } /* Indentation for nested elements */
                    </style>
                `;
        
                // Recursively format data with Tailwind classes
                const recursiveRender = (value, level = 0) => {
                    let content = '';
        
                    // Indentation for each level
                    const indentClass = `indentation level-${level}`;
        
                    if (Array.isArray(value)) {
                        content = `<div class="array scrollable ${indentClass}">${value.map(item => `<div>${recursiveRender(item, level + 1)}</div>`).join('')}</div>`;
                    } else if (value === null) {
                        content = `<div class="null ${indentClass}">null</div>`;
                    } else if (typeof value === 'object') {
                        content = `<div class="object scrollable ${indentClass}">${Object.keys(value).map(key => 
                            `<div><span class="object-key">${key}:</span> <span class="object-value">${recursiveRender(value[key], level + 1)}</span></div>`
                        ).join('')}</div>`;
                    } else if (typeof value === 'string') {
                        content = `<div class="string ${indentClass}">"${value}"</div>`;
                    } else if (typeof value === 'number') {
                        content = `<div class="number ${indentClass}">${value}</div>`;
                    } else if (typeof value === 'boolean') {
                        content = `<div class="boolean ${indentClass}">${value}</div>`;
                    } else if (typeof value === 'undefined') {
                        content = `<div class="undefined ${indentClass}">undefined</div>`;
                    }
        
                    return content;
                };
        
                const htmlContent = `
                    ${tailwindScript}
                    ${tailwindStyles}
                    <div class="debug">
                    <pre class="data-type-wrapper">${recursiveRender(data)}</pre>
                    </div>
                `;
        
                res.set('Content-Type', 'text/html');
                res.send(htmlContent); // Send the formatted data as HTML
            }
            res.end();
        };
        
        global.dump = (data) => {
            const acceptHeader = req.headers['accept'];
        
            // Check if it's a JSON request
            if (acceptHeader && acceptHeader.includes('application/json')) {
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(data, null, 2)); // Raw JSON with indentation
            } else {
                // Tailwind CSS for rendering
                const tailwindScript = `
                    <script src="/global_assets/tailwind.js"></script>
                `;
        
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
                            white-space: pre-wrap; /* Allow text to wrap */
                        }
        
                        .scrollable {
                            max-width: 100%;
                            overflow-x: auto; /* Enable horizontal scroll when necessary */
                        }
        
                        /* Tailwind utility classes for color based on data type */
                        .string { color: #48bb78; } /* Green for strings */
                        .number { color: #ed8936; } /* Orange for numbers */
                        .boolean { color: #3182ce; } /* Blue for booleans */
                        .object-key { color: #a0aec0; font-weight: bold; } /* Gray for object keys */
                        .object-value { color: #2d3748; } /* Dark text for object values */
                        .array { color: #805ad5; } /* Purple for arrays */
                        .null { color: #9b2c2c; } /* Red for null */
                        .undefined { color: #ed8936; } /* Orange for undefined */
                        .indentation { padding-left: 20px; } /* Indentation for nested elements */
                    </style>
                `;
        
                // Recursively format data with Tailwind classes
                const recursiveRender = (value, level = 0) => {
                    let content = '';
        
                    // Indentation for each level
                    const indentClass = `indentation level-${level}`;
        
                    if (Array.isArray(value)) {
                        content = `<div class="array scrollable ${indentClass}">${value.map(item => `<div>${recursiveRender(item, level + 1)}</div>`).join('')}</div>`;
                    } else if (value === null) {
                        content = `<div class="null ${indentClass}">null</div>`;
                    } else if (typeof value === 'object') {
                        content = `<div class="object scrollable ${indentClass}">${Object.keys(value).map(key => 
                            `<div><span class="object-key">${key}:</span> <span class="object-value">${recursiveRender(value[key], level + 1)}</span></div>`
                        ).join('')}</div>`;
                    } else if (typeof value === 'string') {
                        content = `<div class="string ${indentClass}">"${value}"</div>`;
                    } else if (typeof value === 'number') {
                        content = `<div class="number ${indentClass}">${value}</div>`;
                    } else if (typeof value === 'boolean') {
                        content = `<div class="boolean ${indentClass}">${value}</div>`;
                    } else if (typeof value === 'undefined') {
                        content = `<div class="undefined ${indentClass}">undefined</div>`;
                    }
        
                    return content;
                };
        
                const htmlContent = `
                    ${tailwindScript}
                    ${tailwindStyles}
                    <div class="debug">
                    <pre class="data-type-wrapper">${recursiveRender(data)}</pre>
                    </div>
                `;
        
                res.set('Content-Type', 'text/html');
                res.send(htmlContent); // Send the formatted data as HTML
            }
        };
        Server.app.use((req, res, next) => {
            global.req = req;
            global.res = res;
            global.forward = next;
            if (!req.session) {
                req.session = {};
            }
            forward();
        })
    }

    static handle() {
        const sessionObj = {
            secret: process.env.MAIN_KEY || 'secret',
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false },
        };
        return {
            cookieParser: cookieParser(),
            session: session(sessionObj),
            flash: flash()
        };
    }
}


Server.boot();
Server.validateRoute(webRoute);
Server.validateRoute('/api', apiRoute);

module.exports = Server.app;
