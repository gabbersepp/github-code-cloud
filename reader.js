var glob = require("glob")
const fs = require("fs-extra");
//const endings = ["js", "asm", "cs", "ts", "java"];

async function readAndSaveAll(endings) {
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

            // delete words that appear not often enough
            Object.keys(obj).forEach(key => {
                if (obj[key] < 5) {
                    delete obj[key];
                }
            })

            const csv = Object.keys(obj).map(key => `${key};${obj[key]}`).join("\r\n");
            fs.writeFileSync("output/export/data.csv", csv);

            resolve(obj);
        })
    })
}

module.exports = { readAndSaveAll }