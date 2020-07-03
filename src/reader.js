var glob = require("glob")
const fs = require("fs-extra");

async function readAndSaveAll(endings, skipRation) {
    return new Promise(resolve => {
        glob(`output/clones/**/*.+(${endings.join("|")})`, function (er, files) {
            const obj = {};
            
            files.forEach(filePath => {
                const content = fs.readFileSync(filePath).toString();
                content.split("\r\n").map(x => x.replace(/[_\':\"\[\]\,\s\(=\);\{\}\+\-\.\/\\\*\`]+/ig, "#"))
                .forEach(line => {
                    line.split("#").forEach(part => {
                        part = part.trim().toLowerCase();
                        if (!part || part.match(/^[0-9]+$/) || part.length <= 2) {
                            return;
                        }
                        obj[part] = (obj[part] || 0) + 1;
                    })
                });
            });

            let array = [];
            // delete words that appear not often enough
            Object.keys(obj).forEach(key => {
                if (obj[key] < 5) {
                    delete obj[key];
                } else {
                    array.push({
                        key,
                        amount: obj[key]
                    });
                }
            });
            array = array.sort((a, b) => b.amount - a.amount);
            if (skipRation) {
                array = array.slice(0, Math.ceil((1-skipRation) * array.length));
            }
            const max = array[0].amount;
            const min = array[array.length - 1].amount;
            // 50 sections
            const sectionWidth = (max-min) / 20;
            array.forEach(e => { 
                e.amount = Math.ceil(e.amount / sectionWidth);
            });

            const csv = array.map(e => `${e.key};${e.amount}`).join("\r\n");
            fs.writeFileSync("output/export/data.csv", csv);

            resolve(obj);
        })
    })
}

module.exports = { readAndSaveAll }