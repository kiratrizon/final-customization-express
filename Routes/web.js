const Route = require('../main/express/Route');
const WelcomeController = require('../app/Controllers/WelcomeController');

Route.get('/', [WelcomeController, 'welcome']);
Route.get('/test/:id?/:content?', [WelcomeController, 'test']);

Route.get('/user', (req, res) => {
    console.log(ucFirst('hello'));
    res.json({ message: 'User Route' });
});

module.exports = Route;