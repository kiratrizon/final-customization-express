const Route = require('../main/express/Route');
const WelcomeController = require('../app/Controllers/WelcomeController');

Route.get('/', [WelcomeController, 'welcome']);
Route.get('/test/:id?/:content?', [WelcomeController, 'test']);

Route.get('/user', () => {
    res.json({ message: 'User Route' });
});

Route.group({prefix:"/hello", middleware:'test'}, ()=>{
    Route.get('/world', () => {
        dd({ message: 'Hello World' });
    });
    Route.get('/test', () => {
        dd({ message: 'Hello Test' });
    });
    Route.get('/user', () => {
        dd({ message: 'Hello User' });
    });
});

module.exports = Route;