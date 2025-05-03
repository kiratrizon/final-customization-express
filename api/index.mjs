import app from '../main/express/server/connect.mjs';
import serverless from 'serverless-http';
// Wrap your app for serverless deployment
export default serverless(app, {
    request: (req, res) => req,
    response: (req, res) => res
});