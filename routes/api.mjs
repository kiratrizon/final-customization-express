import Route from '../main/express/server/Router/Route.mjs';

import UserController from '../app/Controllers/UserController.mjs';

Route.get('/users', [UserController, 'users']);

export default Route;