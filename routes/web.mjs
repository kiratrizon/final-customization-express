/**
 * @type {typeof import('../main/express/server/Router/Route').default}
 */
const Route = (await import('../main/express/server/Router/Route.mjs')).default;

// Define the routes for the WEB
Route.view('/', 'index');

export default Route;