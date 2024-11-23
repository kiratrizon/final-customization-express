const WelcomeController = require('../app/Controllers/WelcomeController');
const Route = require('../main/express/Route');

// start your route here
Route.get('/', [WelcomeController, 'welcome']);
module.exports = Route;