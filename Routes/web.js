const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router');

Route.resource('/', UserController);

module.exports = Route;