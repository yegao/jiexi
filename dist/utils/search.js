const fs=require("fs"),colors=require("colors"),path=require("path"),prompt=require("prompt");module.exports=function n(e,r){let o=path.resolve(__dirname,"..","..",r);keys=e.split(".");let l=keys[0]+".md",t=path.resolve(o,l);try{let e=fs.readFileSync(t,"utf-8");e=(e=(e=(e=(e=(e=(e=e.replace(/\`{3,}.*?\n([\s\S]*?)\n\`{3,}/g,function(n,e){return e=e.replace(/(\/\/.*)\n/g,function(n){return colors.italic.gray(n)}),colors.cyan(e)+"\n"})).replace(/\`([^\`]*?)\`/g,function(n,e){return colors.magenta(e)})).replace(/(^|\n)\s*\#{5}\s*?(\S.*?)\#*?\s*?\n/g,function(n,e,r){return"\n"+e+colors.bold.yellow("▷ "+r)+"\n"})).replace(/(^|\n)\s*\#{4}\s*?(\S.*?)\#*?\s*?\n/g,function(n,e,r){return"\n"+e+colors.bold.green("◎ "+r)+"\n"})).replace(/(^|\n)\s*\#{3}\s*?(\S.*?)\#*?\s*?\n/g,function(n,e,r){return"\n"+e+colors.bold.blue(r)+"\n"})).replace(/(^|\n)\s*\#{2}\s*?(\S.*?)\#*?\s*?\n/g,function(n,e,r){return"\n"+e+colors.bold.blue.underline(r)+"\n"})).replace(/(^|\n)\s*\#{1}\s*?(\S.*?)\#*?\s*?\n/g,function(n,e,r){return"\n"+e+colors.bold.red(r)+"\n"}),console.log(e)}catch(e){prompt.start(),console.log("搜不到该关键字,请换一个关键字"),prompt.get(["keyword"],function(e,o){e||n(o.keyword,r)})}};