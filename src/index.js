
const fs = require("fs-extra");
const reader = require("./reader");
const github = require("./github");
const cloud = require("./get-cloud");

fs.ensureDirSync("./output");
fs.ensureDirSync("./output/clones");
fs.ensureDirSync("./output/export");

async function generateCloud(githubName, githubToken, extensions) {
    await github.fetchRepositories(githubName, githubToken);
    await reader.readAndSaveAll(extensions);
    await cloud.saveImageAndHtml();
}

//generateCloud("gabbersepp", process.env.GITHUB_TOKEN, ["js", "asm", "cs", "ts", "java"]);


module.exports = { generateCloud }