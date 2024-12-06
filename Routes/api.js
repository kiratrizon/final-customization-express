const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router');

Route.setPrefix('/api');
Route.group({"as":"user", prefix:"/user"}, ()=>{
    Route.resource('/register', UserController, {only: ['store']});
});

module.exports = Route;