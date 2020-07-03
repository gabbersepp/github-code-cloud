const request = require("request");
const cloneOrPull = require('git-clone-or-pull');
const path = require('path');

//process.env.GITHUB_TOKEN
function fetchRepositories(username, token) {
    return new Promise(resolve => {
        request({ 
            url: `https://api.github.com/users/${username}/repos?per_page=100`,
            headers: {
                "Authorization": `token ${token}`,
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

            for (let i = 0; i < repos.length; i++) {
                let x = repos[i];
                console.log(`clone/pull ${x.cloneUrl}`);
                await new Promise(cloneResolved => {
                    cloneOrPull(x.cloneUrl, {
                        implementation: "subprocess",
                        path: path.join(process.cwd(), "output", "clones", x.name)
                    }, function(err) {
                        if (err) {
                            console.error(err);
                            throw err;
                        }
                        cloneResolved();
                    });
                });
            }
        
            resolve(repos);
        });        
    });
}

module.exports = { fetchRepositories }