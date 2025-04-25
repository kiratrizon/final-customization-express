const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router/Route');

Route.get('{/:id}', [UserController, 'index']);



module.exports = Route;