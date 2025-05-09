import UserController from '../app/Controllers/UserController.mjs';

/**
 * @type {typeof import('../main/express/server/Router/Route').default}
 */
const Route = (await import('../main/express/server/Router/Route.mjs')).default;

// Define the routes for the API

Route.get('/users', [UserController, 'users']);
Route.post('/user/auth', [UserController, 'index']);

export default Route;