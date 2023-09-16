const Rino = require('rinojs');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const { copyAssets } = require('./assets');
const { emptyDirectory } = require('./empty-directory');

let domain = "https://YOUR_DOMAIN/";
let name = "Name_OF_YOUR_SITE";

if (domain[domain.length - 1] != "/") domain += '/';

async function build()
{
    try 
    {
        console.log(`


    .::::::::::::::::::::----.
    =*********************###:
    =*********************###:
    =********======+******###:
    =******##      =******###:
    =******##      =******###:
    =******##      =******###:
    =******##......=******###:
    =*********************###+==
    =***********************###*
    =********+++++++++******###*
    =******##        .******###*
    =******##        .******###*
    =******##        .******###*
    =******##        .******###*
    =******##        .******###*
    -+++++*##         ++++++###*

    Rino Docs! Your free opensource markdown documentation tool!

    Built with Rino! Fast learning, preprocessing, intuitive web framework!

    Please support us!

        `);

        let rino = new Rino();
        let directoryPath = path.resolve(__dirname, "./mds/")
        let distdir = path.resolve(`./dist/`);
        let publicdir = path.resolve(`./public/`);

        if (!fs.existsSync(distdir))
        {
            await fs.promises.mkdir(distdir);
        }
        else
        {
            console.log(`Removing old build...`);
            emptyDirectory(distdir, publicdir);
            console.log(`Copying assets now...`);
            await copyAssets(publicdir, distdir);
            console.log(`Copying assets is done...`);
        }

        fs.readdir(directoryPath, async (error, files) =>
        {
            if (error)
            {
                throw new Error(`Error reading /mds directory: ${ error }`);
            }

            const mdFiles = files.filter(file => path.extname(file) === '.md');
            const sortedMdFiles = mdFiles.sort();
            const filepathList = sortedMdFiles.map(file => path.join(directoryPath, file));
            const filenameList = mdFiles.map(file => path.parse(file).name);
            const sitemapList = [];

            sitemapList.push(`${ domain }`);
            for (let i = 1; i < filenameList; i++)
            {
                sitemapList.push(`${ domain }${ filenameList[i] }.html`);
            }

            if (sitemapList && sitemapList.length > 0) await rino.generateSitemapFile(sitemapList, path.join(distdir, "sitemap.xml"));

            let themePath = path.resolve(__dirname, "./pages/index.tot").toString();
            let theme = null;
            let html = "";
            let start = 0;
            let end = 0;
            let target = "";
            let size = filepathList.length;

            for (let i = 0; i < size; i++)
            {
                let markdown = await fs.promises.readFile(filepathList[i], 'utf8', (error, data) =>
                {
                    if (error) throw error;
                    else return data;
                });

                markdown = marked.parse(markdown);
                let md_text = markdown.replace(/(<([^>]+)>)/gi, '').substring(0, 150);

                theme = await rino.buildPage({
                    filename: themePath,
                    data:
                    {
                        title: filenameList[i],
                        desc: md_text,
                        url: `${ domain }${ filenameList[i] }.html`,
                        sitename: name,
                        pageList: filenameList
                    }
                });

                html = theme.html;
                let result = "";

                while (html.length > 0)
                {
                    start = html.indexOf("{{") + 2;
                    end = await findEnd(html, start);

                    if (start == 1 || end == -1)
                    {
                        result = result + html;
                        break;
                    }

                    result = result + html.substring(0, start - 2);
                    target = html.substring(start, end).trim();
                    html = html.substring(end + 2);

                    if (target.substring(0, 8) == "@content")
                    {
                        result = result + markdown;
                        break;
                    }
                    else
                    {
                        result = result + `{{ ${ target } }}`;
                    }
                }

                let htmlfilename = path.resolve(`./dist/${ filenameList[i] }.html`)
                if (i == 0) htmlfilename = path.resolve(`./dist/index.html`)

                await fs.promises.writeFile(htmlfilename, result);

                console.log(`Building ${ i + 1 }/${ size } pages`);
            }

            if (theme)
            {
                if (theme.js) await fs.promises.writeFile(path.resolve(`./dist/main.js`), theme.js);
                if (theme.css) await fs.promises.writeFile(path.resolve(`./dist/style.css`), theme.css);
            }

            console.log("Build is completed!");
        });
    }
    catch (error)
    {
        console.error(error);
    }
}

async function findEnd(content, start)
{
    if (!content) return -1;
    let end = -1;
    let depth = 1;

    for (let i = start; i < content.length; i++)
    {
        if (content[i] === "{" && content[i + 1] === "{")
        {
            depth++;
            i++;
        }
        else if (content[i] === "}" && content[i + 1] === "}")
        {
            depth--;

            if (depth === 0)
            {
                end = i;
                break;
            }

            i++;
        }
    }

    return end;
}

build();