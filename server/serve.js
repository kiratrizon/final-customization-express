const webRoute = require('../Routes/web');
const apiRoute = require('../Routes/api');

class Server {
    static app = require('express')();
    static validateRoute(route) {
        if (!route || !route.classRoute || !(route.classRoute instanceof express.Router)) {
            return;
        }
    }
}

try {
    Server.validateRoute(webRoute);
    Server.validateRoute(apiRoute);

    Server.app.use(webRoute.mainRouter);
    Server.app.use('/api', apiRoute.mainRouter);

} catch (error) {

}
module.exports = Server.app;
