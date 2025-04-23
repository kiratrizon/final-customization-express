const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router/Route');

Route.view('/', 'login', {
    title: 'Home',
    description: 'Welcome to the home page'
});
module.exports = Route;