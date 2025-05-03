import { pathToFileURL } from 'url';
class AppProviders {

    static async register() {
        return {
            'STREAM': await import(pathToFileURL(base_path('main/express/server/Router/RouteHandlers/stream.mjs')).href),

        };
    }
}

export default AppProviders;