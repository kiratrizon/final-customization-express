import Route from '../main/express/server/Router/Route.mjs';

import UserController from '../app/Controllers/UserController.mjs';


Route.post('/login', [UserController, 'login']);
Route.get('/auth/user', [UserController, 'index']).middleware('user');
Route.get('/users', [UserController, 'users']);
Route.get('/admins', [UserController, 'admins']);


export default Route;