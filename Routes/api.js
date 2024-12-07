const UserController = require('../app/Controllers/UserController');
const AdminController = require('../app/Controllers/AdminController');
const Route = require('../main/express/server/Router');

Route.setPrefix('/api');
Route.group({ "as": "user", prefix: "/user" }, () => {
    Route.resource('/register', UserController, { only: ['store'] });
});

Route.group({ "as": "admin", prefix: "/admin" }, () => {
    Route.post('/login', [AdminController, 'login']).name('login');
    Route.resource('/register', AdminController, { only: ['store'] });
});

module.exports = Route;