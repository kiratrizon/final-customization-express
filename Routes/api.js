const Route = require('../main/express/server/Router/Route');

const UserController = require('../app/Controllers/UserController');
Route.get('/', () => {
    return {
        title: 'Home',
        description: 'Welcome to the home page'
    }
})
module.exports = Route;