const chokidar = require('chokidar');
const { buildThis } = require('./build-this');

async function createWatcher(directoryPath, distdir, publicdir, domain, name, src, port, wss)
{
    const watcher = chokidar.watch([src, publicdir]).on('change', async (filepath) =>
    {
        await buildThis(directoryPath, distdir, publicdir, domain, name);

        console.log(`File ${ filepath } has been changed`);
        console.log("Rebuilding...");

        setTimeout(() =>
        {
            wss.clients.forEach((client) =>
            {
                client.send('reload');
            });
        }, 333);

        console.log(`Server listening on port ${ port }`);
        console.log(`Check http://localhost:${ port }`);
    })

    return watcher;
}

module.exports = { createWatcher }