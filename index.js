const request = require("request");
const cloneOrPull = require('git-clone-or-pull');
const path = require('path');
const fs = require("fs-extra");
const reader = require("./reader");

function readRepositories() {
    return new Promise(resolve => {
        request({ 
            url: "https://api.github.com/users/gabbersepp/repos?per_page=100",
            headers: {
                "Authorization": "token " + process.env.GITHUB_TOKEN,
                "User-Agent": "node.js"
            }
        }, async (err, resp, body) => {
            var repos = JSON.parse(body);
            repos = repos.filter(x => !x.fork && !x.archived && !x.private).map(x => ({
                url: x.html_url,
                description: x.description,
                language: x.language,
                id: x.id,
                cloneUrl: x.clone_url,
                name: x.name
            }));

            fs.ensureDirSync("./clones");

            for (let i = 0; i < repos.length; i++) {
                let x = repos[i];
                await new Promise(cloneResolved => {
                    cloneOrPull(x.cloneUrl, {
                        implementation: "subprocess",
                        path: path.join(process.cwd(), "clones", x.name)
                    }, function(err) {
                        if (err) throw err;

                        cloneResolved();
                    });
                });
            }

        
            resolve(repos);
        });        
    });
}

async function doAll() {
    //await readRepositories();
    const obj = await reader.readAll();
    const csv = Object.keys(obj).map(key => `${key};${obj[key]}`).join("\r\n");
    fs.writeFileSync("data.csv", csv);
    return;
}

doAll();
