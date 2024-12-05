const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router');

Route.get('/', ()=>{
    SESSION_AUTH['user'] = 'Eirazen';
    dd(SESSION);
});

Route.group({as:"parent", prefix:"/parent"}, ()=>{
    Route.group({as:"child", prefix:"/child"}, ()=>{
        Route.group({as:"grandchild", prefix:"/grandchild"}, ()=>{
            Route.resource('/resource', UserController);
        });
    });
});

module.exports = Route;