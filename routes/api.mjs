/**
 * @type {typeof import('../main/express/server/Router/Route').default}
 */
const Route = (await import('../main/express/server/Router/Route.mjs')).default;

import UserController from '../app/Controllers/UserController.mjs';
import AdminController from '../app/Controllers/AdminController.mjs';

Route.get('/users', [UserController, 'users']);
Route.group({ "prefix": "user" }, () => {

    Route.post('/login', [UserController, 'login']);
    Route.get('/me', [UserController, 'index']).middleware('user');
    Route.get('/{id}', [UserController, 'getUser']).middleware('user').where({
        'id': 'digit'
    });
});

Route.get('/admins', [AdminController, 'admins']);
Route.group({ "prefix": "admin" }, () => {

    Route.post('/login', [AdminController, 'login']);
    Route.get('/me', [AdminController, 'index']).middleware('admin');
    Route.get('/{id}', [AdminController, 'getAdmin']).middleware('admin').where({
        'id': 'digit'
    });
});

export default Route;