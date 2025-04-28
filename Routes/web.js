const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Route');

Route.all('/:id', [UserController, 'index']).where({
    'id': 'digit'
}).middleware('test');



module.exports = Route;