import Server from './index.mjs';

// boot

let booted = false;
if (!booted) {
    await Server.boot();
    booted = true;
}

export default Server.app;