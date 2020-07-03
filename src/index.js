
const fs = require("fs-extra");
const path = require("path");
const reader = require("./reader");
const github = require("./github");
const cloud = require("./get-cloud");

async function generateCloud(githubName, githubToken, extensions, outputFolder, skipRation, optionsToMerge) {
    if (!outputFolder) {
        outputFolder = path.join(process.cwd(), "output");
    }

    fs.ensureDirSync(outputFolder);

    await github.fetchRepositories(outputFolder, githubName, githubToken);
    await reader.readAndSaveAll(outputFolder, extensions, skipRation);
    await cloud.saveImageAndHtml(outputFolder, optionsToMerge);
}

generateCloud("gabbersepp", process.env.GITHUB_TOKEN, ["js", "asm", "cs", "ts", "java", "cpp"],  path.join(process.cwd(), "temp") , 0.8, { color: "black" });


module.exports = { generateCloud }