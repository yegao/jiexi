const fs = require('fs')
let uglifyEs = require('uglify-es')
fs.writeFileSync(
    "dist/index.js", 
    uglifyEs.minify(fs.readFileSync("src/index.js", "utf8")).code
);
fs.writeFileSync(
    "dist/utils/search.js", 
    uglifyEs.minify(fs.readFileSync("src/utils/search.js", "utf8")).code
);



