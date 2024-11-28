const Route = require('../main/express/server/Router');

Route.setPrefix('/api');
Route.group({prefix:"v1",as:"v1"}, ()=>{
    Route.get('/', (id = 0)=>{
        dd(request);
    });
});

module.exports = Route;