/**
 * @type {typeof import('../main/express/server/Router/Route').default}
 */
const Route = (await import('../main/express/server/Router/Route.mjs')).default;

Route.view('/', 'index');

export default Route;