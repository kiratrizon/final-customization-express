const Route = require('../main/express/server/Router');

Route.setPrefix('/api');
Route.get('/:id?', (id = 0)=>{
    dd(request)
});

module.exports = Route;