const Rino = require('rinojs');
const path = require('path');
const fs = require('fs');

let domain = "https://YOUR_DOMAIN/";

if (domain[domain.length - 1] != "/") domain += '/';

function generateSitemap()
{
    let rino = new Rino();
    let list = setupLinkList(path.resolve("./src/mds/"));

    let sitemap = [];
    sitemap.push(domain);

    for (let i = 1; i < list.length; i++)
    {
        sitemap.push(domain + list[i]);
    }

    rino.generateSitemapFile(sitemap, path.resolve("./public/sitemap.xml"));
}

function setupLinkList(filename, locale = "")
{
    let list = getFilenameList(filename);

    list = list.map(file => path.parse(file).name);
    list = list.sort((a, b) =>
    {
        let numA = 0;
        let numB = 0;
        if (a.includes(". "))
        {
            numA = parseInt(a.split(`. `)[0], 10);
            numB = parseInt(b.split(`. `)[0], 10);
        }
        else
        {
            numA = parseInt(a, 10);
            numB = parseInt(b, 10);
        }

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
    list = list.map(file => file.replace(/^\d+\.\s*/, '').trim() + ".html");

    if (locale)
    {
        list = list.map(file => locale + "/" + file);
    }

    return list;
}

function getFilenameList(dir)
{
    try
    {
        let files = [];
        const dirContents = fs.readdirSync(dir);

        for (const item of dirContents)
        {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory())
            {
                files = files.concat(getFilenameList(itemPath));
            }
            else
            {
                files.push(itemPath);
            }
        }

        return files;
    }
    catch (error)
    {
        console.error(`Error reading directory ${ dir }: ${ error }`);
    }
}

generateSitemap();