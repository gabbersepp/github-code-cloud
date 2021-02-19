
const fs = require("fs-extra");
const path = require("path");
const reader = require("./reader");
const github = require("./github");
const cloud = require("./get-cloud");

async function generateCloud(githubName, githubToken, extensions, outputFolder, skipRation, optionsToMerge, puppeteerOptions) {
    optionsToMerge = optionsToMerge || {};
    if (!outputFolder) {
        outputFolder = path.join(process.cwd(), "output");
    }

    outputFolder = path.resolve(outputFolder);
    fs.ensureDirSync(outputFolder);

    const repos = await github.fetchRepositories(outputFolder, githubName, githubToken);
    console.log(`pulled ${repos.length} repositories`);
    const readerResult = await reader.readAndSaveAll(outputFolder, extensions, skipRation);
    console.log(`got reader result: \r\n${JSON.stringify(readerResult)}\r\n`);
    await cloud.saveImageAndHtml(outputFolder, optionsToMerge, puppeteerOptions);
}

//generateCloud("gabbersepp", process.env.GITHUB_TOKEN, ["js", "asm", "cs", "ts", "java", "cpp"],  path.join(process.cwd(), "temp") , 0.8, { color: "black", maxRetry: 500 }, { headless: true });

module.exports = { generateCloud }