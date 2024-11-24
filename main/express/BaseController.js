class BaseController {
    #req;
    #res;
    init(req, res, request) {
        this.#req = req;
        this.#res = res;
        if (global.request === undefined) {
            global.request = request;
        }
        if (global.response === undefined) {
            global.response = () => this.#res;
        }
        if (global.dd === undefined) {
            global.dd = (data) => {
                const acceptHeader = this.#req.headers['accept'];

                if (acceptHeader && acceptHeader.includes('application/json')) {
                    this.#res.set('Content-Type', 'application/json');
                    this.#res.send(JSON.stringify(data, null, 2));
                } else {
                    const tailwindStyles = `
                        <style>
                            body { font-family: sans-serif; padding: 20px; background-color: #f8fafc; }
                            pre { background-color: #e2e8f0; padding: 20px; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word; }
                            h1 { font-size: 1.5rem; font-weight: 600; color: #1a202c; margin-bottom: 1rem; }
                        </style>
                    `;

                    const htmlContent = `
                                        <!DOCTYPE html>
                                        <html lang="en">
                                        <head>
                                            <meta charset="UTF-8">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <title>Debug Output</title>
                                            ${tailwindStyles}
                                        </head>
                                        <body>
                                            <h1>Dump and Die</h1>
                                            <pre>${JSON.stringify(data, null, 2)}</pre>
                                        </body>
                                        </html>
                                    `;

                    this.#res.set('Content-Type', 'text/html');
                    this.#res.send(htmlContent);
                }
                this.#res.end();
            }
        }
    }
}

module.exports = BaseController;
