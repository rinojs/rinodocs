const path = require('path');

const domain = "https://YOUR_DOMAIN/";
const name = "Name_OF_YOUR_SITE";

async function pages()
{
    return [
        {
            data: {
                title: "Theme development",
                desc: "Rino Documentation",
                url: `${ domain }some.html`,
                sitename: name,
                pageList: [
                    "Test 1",
                    "Test 2",
                    "Test 3",
                    "Test 4"
                ]
            },
            pageFilename: path.resolve(__dirname, "./pages/index.tot"),
            distDirname: path.resolve(__dirname, "../themedist/"),
            filenames: {
                css: "style.css",
                js: "main.js"
            }
        }
    ]
}

module.exports = { pages }