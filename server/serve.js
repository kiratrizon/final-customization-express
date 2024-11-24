const webRoute = require('../Routes/web');
const apiRoute = require('../Routes/api');
const path = require('path');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
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
        Server.app.use(Server.express.json());
        Server.app.use(Server.express.urlencoded({ extended: true }));
        Server.app.use(Server.express.static(path.join(__dirname, '..', 'public')));
        const handleBoot = Server.handle();
        Object.keys(handleBoot).forEach((key) => {
            Server.app.use(handleBoot[key]);
        });

        Server.app.use((req, res, next) => {
            if (!req.session) {
                req.session = {};
            }
            next();
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
