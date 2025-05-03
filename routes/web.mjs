import Route from '../main/express/server/Router/Route.mjs';


Route.get('/', async () => {
    return response().json({ message: 'Hello World' });
});

export default Route;