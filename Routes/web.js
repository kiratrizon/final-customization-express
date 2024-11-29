const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router');

Route.resource('/user', UserController);

module.exports = Route;