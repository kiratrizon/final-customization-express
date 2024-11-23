const Route = require('../main/express/Route');
const WelcomeController = require('../app/Controllers/WelcomeController');

Route.get('/', [WelcomeController, 'welcome']);
Route.get('/test/:id', [WelcomeController, 'test']);

Route.get('/user', (req, res) => {
    res.json({ message: 'User Route' });
});

module.exports = Route;