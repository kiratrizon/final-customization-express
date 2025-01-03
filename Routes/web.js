const UserController = require('../app/Controllers/UserController');
const UserDashboard = require('../app/Controllers/UserDashboard');
const Route = require('../main/express/server/Router');

Route.get('/', [UserController, 'index']).name('home');
Route.post('/', [UserController, 'store2']).name('store2');
Route.post('/login', [UserController, 'login']).name('login');
Route.get('/login', () => {
    return view('login');
}).name('signin');

Route.group({
    middleware: 'test',
    as: 'user',
    prefix: '/user'
}, () => {
    Route.resource('/dashboard', UserDashboard)
});

module.exports = Route;