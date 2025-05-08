/**
 * @type {typeof import('../main/express/server/Router/Route').default}
 */
const Route = (await import('../main/express/server/Router/Route.mjs')).default;

// Define the routes for the API

export default Route;