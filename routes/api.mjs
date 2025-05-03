import Route from '../main/express/server/Router/Route.mjs';

import UserController from '../app/Controllers/UserController.mjs';

Route.get('/users', [UserController, 'users']);
Route.group({ "prefix": "user" }, () => {

    Route.post('/login', [UserController, 'login']);
    Route.get('/me', [UserController, 'index']).middleware('user');
    Route.get('/{id}', [UserController, 'index']).middleware('user').where({
        'id': 'digit'
    });
})

export default Route;