const Route = require('../main/express/server/RouteApi');

Route.get('/', ()=>{
    return json({'welcome': 'Welcome to the API'});
});

module.exports = Route;