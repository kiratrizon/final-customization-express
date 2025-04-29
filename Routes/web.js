const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router/Route');

Route.all('/:id', [UserController, 'index']).where({
    'id': 'digit'
});

Route.get('/user/:id', [UserController, 'show']).middleware('test').where({
    'id': 'digit'
});



module.exports = Route;