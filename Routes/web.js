const UserController = require('../app/Controllers/UserController');
const Route = require('../main/express/server/Router');

Route.get('/', ()=>{
    const id = 1;
    redirect(route('parent.child.grandchild.resource.show', {id}))
});

Route.group({as:"parent", prefix:"/parent"}, ()=>{
    Route.group({as:"child", prefix:"/child"}, ()=>{
        Route.group({as:"grandchild", prefix:"/grandchild"}, ()=>{
            Route.resource('/resource', UserController);
        });
        Route.get('/test', [UserController, 'getUser']).name('test');
    });
});

module.exports = Route;