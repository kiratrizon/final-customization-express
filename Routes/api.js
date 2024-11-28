const Route = require('../main/express/server/RouterV2');

Route.setPrefix('/api');
Route.group({prefix:"v1",as:"v1"}, ()=>{
    Route.get('/', (id = 0)=>{
        dd(request);
    });
});

module.exports = Route;