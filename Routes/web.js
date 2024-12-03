const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router');

Route.resource('/user', UserController);
Route.post('/user/login', [UserController, 'login']);
Route.get('/getUser', [UserController, 'getUser']).middleware('test');

module.exports = Route;