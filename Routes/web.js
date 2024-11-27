const Route = require('../main/express/server/Route');

Route.get('/', ()=>{
    const message = 'Hello, Welcome to the Web';
    return view('welcome', {message});
});

module.exports = Route;