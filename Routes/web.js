const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router');

Route.get('/', [UserController, 'index']).name('home');

module.exports = Route;