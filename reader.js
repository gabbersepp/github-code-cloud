var glob = require("glob")
const fs = require("fs-extra");
const endings = ["js", "asm", "cs", "ts", "java"];

async function readAll() {
    return new Promise(resolve => {
        glob(`clones/**/*.+(${endings.join("|")})`, function (er, files) {
            const obj = {};
            
            files.forEach(filePath => {
                const content = fs.readFileSync(filePath).toString();
                //.replace(/\s+/gm,' ')
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

            Object.keys(obj).forEach(key => {
                if (obj[key] < 5) {
                    delete obj[key];
                }
            })

            resolve(obj);
        })
    })
}


module.exports = { readAll }