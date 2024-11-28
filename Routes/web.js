const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router');

Route.resource('/', UserController);
// Route.get('/', [UserController, 'index']).name('user').middleware('test');
Route.group({prefix:"/test", middleware:"hello", as:"test"}, ()=>{
    Route.group({prefix:"/hello", middleware:"test", as:"hello"}, ()=>{
        Route.resource('/admin', UserController);
        Route.get('/testing', [UserController, 'index']).name('testing');
    });
});
module.exports = Route;