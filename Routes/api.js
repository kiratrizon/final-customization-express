const Route = require('../main/express/server/Router/Route');

const UserController = require('../app/Controllers/UserController');
const Auth = require('../main/express/server/Auth');
Route.post('/login', [UserController, 'login']);
Route.get('/auth/user', [UserController, 'index']).middleware(async (request, next) => {
    if (!Auth.check()) {
        return response().json({ message: 'Unauthorized' }, 401);
    }
    return next(request);
});

Route.get('/users', [UserController, 'users']);
module.exports = Route;