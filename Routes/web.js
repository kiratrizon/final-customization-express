const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router/Route');

Route.group({ prefix: "", middleware: "hello", as: "hello" }, () => {
    Route.group({ prefix: "", middleware: "hello", as: "hello" }, () => {
        Route.get('/', [UserController, 'index']).name('index').middleware('test');
    });
});
Route.get('/', [UserController, 'index']).middleware('test');
module.exports = Route;