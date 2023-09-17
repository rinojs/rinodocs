const Rino = require('rinojs');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const { copyAssets } = require('./assets');
const { emptyDirectory } = require('./empty-directory');

async function buildThis(mddir, distdir, publicdir, domain, name)
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

        if (!fs.existsSync(distdir))
        {
            await fs.promises.mkdir(distdir);
        }

        console.log(`Removing old build...`);
        emptyDirectory(distdir, publicdir);
        console.log(`Copying assets now...`);
        await copyAssets(publicdir, distdir);
        console.log(`Copying assets is done...`);

        fs.readdir(mddir, async (error, files) =>
        {
            if (error)
            {
                throw new Error(`Error reading /mds directory: ${ error }`);
            }

            const mdFiles = files.filter(file => path.extname(file) === '.md');
            const sortedMdFiles = mdFiles.sort((a, b) =>
            {
                const numA = parseInt(a, 10);
                const numB = parseInt(b, 10);

                if (numA < numB)
                {
                    return -1;
                }
                else if (numA > numB)
                {
                    return 1;
                }

                return 0;
            });
            const fixedMdFiles = sortedMdFiles.map(file => file.replace(/^\d+\.\s*/, '').trim());
            const filepathList = sortedMdFiles.map(file => path.join(mddir, file));
            const filenameList = fixedMdFiles.map(file => path.parse(file).name);
            const sitemapList = [];

            sitemapList.push(`${ domain }`);
            for (let i = 1; i < filenameList; i++)
            {
                sitemapList.push(`${ domain }${ filenameList[i] }.html`);
            }

            if (sitemapList && sitemapList.length > 0) await rino.generateSitemapFile(sitemapList, path.join(distdir, "sitemap.xml"));

            let themePath = path.resolve(__dirname, "./pages/index.tot").toString();
            let theme = null;
            let size = filepathList.length;

            for (let i = 0; i < size; i++)
            {
                let markdown = await fs.promises.readFile(filepathList[i], 'utf8', (error, data) =>
                {
                    if (error) throw error;
                    else return data;
                });

                markdown = marked.parse(markdown);
                markdown = markdown.replaceAll("{{", "&#123;&#123;");
                markdown = markdown.replaceAll("}}", "&#125;&#125;");
                let md_text = markdown.replace(/(<([^>]+)>)/gi, '').substring(0, 150);
                md_text = md_text.replaceAll(`'`, ``)
                md_text = md_text.replaceAll(`"`, ``)

                theme = await rino.buildPage({
                    filename: themePath,
                    data:
                    {
                        title: filenameList[i],
                        desc: md_text,
                        url: `${ domain }${ filenameList[i] }.html`,
                        sitename: name,
                        pageList: filenameList,
                        content: markdown
                    }
                });

                let htmlfilename = path.join(distdir, `${ filenameList[i] }.html`)
                if (i == 0) htmlfilename = path.join(distdir, `index.html`)

                await fs.promises.writeFile(htmlfilename, theme.html);


                console.log(`Building ${ i + 1 }/${ size } pages`);
            }

            if (theme)
            {
                if (theme.js) await fs.promises.writeFile(path.join(distdir, `main.js`), theme.js);
                if (theme.css) await fs.promises.writeFile(path.join(distdir, `style.css`), theme.css);
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

module.exports = { buildThis }