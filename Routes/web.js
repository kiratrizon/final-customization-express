const Route = require('../main/express/Route');

Route.get('/', function(){
    const message = 'Hello World!';
    return view('welcome', {message});
});

module.exports = Route;