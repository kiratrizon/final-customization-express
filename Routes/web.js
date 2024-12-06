const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router');

Route.get('/', ()=>{
    dd(REQUEST);
});

module.exports = Route;