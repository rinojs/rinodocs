const path = require('path');
const { buildThis } = require('./build-this');
const { findPort } = require('./find-port');
const { createServer } = require('./server');
const { openBrowser } = require('./browser');
const { createWSS } = require('./wss');
const { createWatcher } = require('./watcher');

let directoryPath = path.resolve(__dirname, "./mds/")
let distdir = path.resolve(`./dist/`);
let publicdir = path.resolve(`./public/`);
let domain = "https://YOUR_DOMAIN/";
let name = "Name_OF_YOUR_SITE";
let src = path.resolve(`./src/`);

if (domain[domain.length - 1] != "/") domain += '/';

async function dev()
{
    await buildThis(directoryPath, distdir, publicdir, domain, name);

    let port = await findPort(3000);
    const server = await createServer(distdir, port);
    const wss = await createWSS(server);
    const url = `http://localhost:${ port }`

    setTimeout(async () =>
    {
        await openBrowser(url);
    }, 333);

    await createWatcher(directoryPath, distdir, publicdir, domain, name, src, port, wss);
}

dev();