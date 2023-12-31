const Rino = require('rinojs');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const { copyAssets } = require('./assets');
const { emptyDirectory } = require('./empty-directory');

async function buildThis(mddir, distdir, publicdir, domain, name, locale = "")
{
    try 
    {
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
            const onlyFilenames = sortedMdFiles.map(file => path.parse(file).name);
            const filepathList = sortedMdFiles.map(file => path.join(mddir, file));
            const onlyNames = onlyFilenames.map(file => file.replace(/^\d+\.\s*/, '').trim());

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
                        title: onlyNames[i],
                        desc: md_text,
                        url: `${ domain }${ onlyNames[i] }.html`,
                        sitename: name,
                        pageList: onlyNames,
                        locale: locale,
                        content: markdown
                    }
                });

                let htmlfilename = path.join(distdir, `${ onlyNames[i] }.html`)
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

module.exports = { buildThis }