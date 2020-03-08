const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");

async function waitUntilCloudIsReady(page) {
    return await page.evaluate(async () => {
        function sleep() {
            return new Promise(resolve => {
                setTimeout(resolve, 1000);
            })
        }
        let maxRetry = 100;
        let success = false;

        while(maxRetry > 0) {
            if (window.wordcloudfinished) {
                success = true;
                break;
            }

            maxRetry--;
            await sleep();
        }

        return success;
    });
}

async function saveImageAndHtml() {
    try {
        const csvData = fs.readFileSync(path.join(process.cwd(), "output", "export", "data.csv")).toString();
        let template = fs.readFileSync(path.join(__dirname, "template.html")).toString();
        template = template.replace("#DATA#", csvData);
        fs.writeFileSync(path.join(process.cwd(), "output", "template.html"), template);
        fs.copyFileSync(path.join(__dirname, "..", "..", "wordcloud", "src", "wordcloud2.js"), "output/wordcloud2.js");
        const browser = await puppeteer.launch()
        const page = await browser.newPage();
        await page.setViewport({
            width: 1280,
            height: 1024
        });
        await page.goto(`file://${process.cwd()}/output/template.html`);

        const cloudReady = await waitUntilCloudIsReady(page);
        if (!cloudReady) {
            throw new Error("cloud could not be finished in 100 seconds");
        }
        const nodeHander = await page.$("#cloud_container");
        const innerHtml = await page.evaluate(node => node.innerHTML.toString(), nodeHander);
        const html = innerHtml.toString();
        fs.writeFileSync(path.join(process.cwd(), "output", "export", "output.html"), html);
        nodeHander.dispose();
        const canvasNodeHandler = await page.$("#cloud_canvas");
        const imgData = await page.evaluate(node => {
            return node.toDataURL();
        }, canvasNodeHandler);

        var data = imgData.replace(/^data:image\/\w+;base64,/, "");
        var buffer = new Buffer(data, 'base64');

        fs.writeFileSync(path.join(process.cwd(), "output", "export", "img.png"), buffer);
        canvasNodeHandler.dispose();
    
        await browser.close();

    } catch (e) {
        console.error(e);
    }
}

module.exports = { saveImageAndHtml }