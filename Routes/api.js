const Route = require('../main/express/server/Router/Route');

const UserController = require('../app/Controllers/UserController');

Route.post('/login', [UserController, 'login']);
Route.get('/auth/user', [UserController, 'index']).middleware('test');
Route.get('/users', [UserController, 'users']);


module.exports = Route;