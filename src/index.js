
const fs = require("fs-extra");
const reader = require("./reader");
const github = require("./github");
const cloud = require("./get-cloud");

fs.ensureDirSync("./output");
fs.ensureDirSync("./output/clones");
fs.ensureDirSync("./output/export");

async function generateCloud(githubName, githubToken, extensions, outputFolder, skipRation, optionsToMerge) {
    await github.fetchRepositories(githubName, githubToken);
    await reader.readAndSaveAll(extensions, skipRation);
    await cloud.saveImageAndHtml(optionsToMerge, outputFolder);
}

//generateCloud("gabbersepp", process.env.GITHUB_TOKEN, ["js", "asm", "cs", "ts", "java", "cpp"], 0.8, { color: "black" });


module.exports = { generateCloud }