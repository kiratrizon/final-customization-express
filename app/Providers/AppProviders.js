class AppProviders {

    static register() {
        return {
            'STREAM': require(base_path('main/express/server/Router/RouteHandlers/stream')),

        };
    }
}

module.exports = AppProviders;