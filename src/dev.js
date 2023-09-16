const Rino = require('rinojs');
const path = require('path');
const { pages } = require("./pages.js");

async function dev()
{
    let rino = new Rino();

    let args = {
        pages: await pages(),
        distRoot: path.resolve(__dirname, "../themedist/"),
        src: path.resolve(__dirname, "./"),
        publicDirname: path.resolve(__dirname, "../public/")
    }

    await rino.dev(args);
}

dev();