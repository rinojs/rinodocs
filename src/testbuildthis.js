const { buildThis } = require('./build-this');
const path = require('path');

async function testbuildthis()
{
    let directoryPath = path.resolve(__dirname, "./mds/")
    let distdir = path.resolve(`./dist/`);
    let publicdir = path.resolve(`./public/`);
    let domain = "https://YOUR_DOMAIN/";
    let name = "Name_OF_YOUR_SITE";

    buildThis(directoryPath, distdir, publicdir, domain, name);
}

testbuildthis();