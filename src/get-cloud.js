const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");
const nm = require("node_modules-path");

async function waitUntilCloudIsReady(page, mR) {
    // this code is executed in the context of the rendered page
    // you can not access variables from the outer context
    // use this: https://stackoverflow.com/questions/46088351/how-can-i-pass-variable-into-an-evaluate-function
    return await page.evaluate(async (maxRetry) => {
        function sleep() {
            return new Promise(resolve => {
                setTimeout(resolve, 1000);
            })
        }
        
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
    }, mR);
}

async function saveImageAndHtml(outputFolder, optionsToMerge, puppeteerOptions) {
    optionsToMerge.maxRetry = optionsToMerge.maxRetry || 500;
    try {
        const csvData = fs.readFileSync(path.join(outputFolder, "export", "data.csv")).toString();
        let template = fs.readFileSync(path.join(__dirname, "template.html")).toString();
        template = template.replace("#DATA#", csvData);
        template = template.replace("#TOMERGE#", JSON.stringify(optionsToMerge));
        fs.writeFileSync(path.join(outputFolder, "template.html"), template);

        console.log("prepare wordcloud2.js to fix a bug")
        const wc2DestPath = path.join(outputFolder, "wordcloud2.js");
        fs.copyFileSync(path.join(nm(), "wordcloud", "src", "wordcloud2.js"), wc2DestPath);
        let wc2Content = fs.readFileSync(wc2DestPath).toString();
        wc2Content = wc2Content.replace("var imageData = fctx.getImageData(0, 0, width, height).data", `
        let imageData;
        // Get the pixels of the text
        try {
        imageData = fctx.getImageData(0, 0, width, height).data
        } catch (e){
          console.log(\`got an error but inored: \${e}\`)
        }
        `)
        fs.writeFileSync(wc2DestPath, wc2Content);

        console.log("launch puppeteer");

        const browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.setViewport({
            width: optionsToMerge.width || 1280,
            height: optionsToMerge.height || 1024
        });

        console.log("navigate to page");

        page.on("pageerror", (err) => {  
            theTempValue = err.toString();
            console.error("Error: " + theTempValue); 
            process.exit(-1);
        });

        await page.goto(`file://${outputFolder}/template.html`);

        const cloudReady = await waitUntilCloudIsReady(page, optionsToMerge.maxRetry);
        if (!cloudReady) {
            throw new Error(`cloud could not be finished in ${optionsToMerge.maxRetry} seconds`);
        } else {
            console.log("finished rendering");
        }
        const nodeHander = await page.$("#cloud_container");
        const innerHtml = await page.evaluate(node => node.innerHTML.toString(), nodeHander);
        const html = innerHtml.toString();
        fs.writeFileSync(path.join(outputFolder, "export", "output.html"), html);
        nodeHander.dispose();
        const canvasNodeHandler = await page.$("#cloud_canvas");
        const imgData = await page.evaluate(node => {
            return node.toDataURL();
        }, canvasNodeHandler);

        var data = imgData.replace(/^data:image\/\w+;base64,/, "");
        var buffer = new Buffer(data, 'base64');

        fs.writeFileSync(path.join(outputFolder, "export", "img.png"), buffer);
        canvasNodeHandler.dispose();
    
        await browser.close();

    } catch (e) {
        console.error(e);
        throw e;
    }
}

module.exports = { saveImageAndHtml }