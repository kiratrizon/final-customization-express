const Route = require('../main/express/server/Router');

Route.setPrefix('/api');
Route.get('/', (id = 0)=>{
    dd(REQUEST);
});

module.exports = Route;