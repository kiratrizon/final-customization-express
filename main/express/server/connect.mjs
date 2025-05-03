import Server from './index.mjs';

// boot

// await Server.boot();

Server.app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
})
export default Server.app;