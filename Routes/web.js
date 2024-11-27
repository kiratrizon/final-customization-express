const Route = require('../main/express/server/Router');
const path = require('path');

Route.get('/', ()=>{
    const message = `Hello, Welcome to the Web `;
    const viewpath = `view path is here ${path.relative(base_path(), view_path())}`;
    return view('welcome', {message, viewpath});
}).middleWare('test');

module.exports = Route;