const { findPort } = require('./find-port');
const { openBrowser } = require('./browser');
const { createServer } = require('./server');
const path = require('path');

async function view()
{
    let port = await findPort(3000);
    await createServer(path.resolve("./dist"), port);
    const url = `http://localhost:${ port }`;
    await openBrowser(url);
}

view();