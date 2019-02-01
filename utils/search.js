const fs = require('fs')
const colors = require('colors')
const path = require('path')

module.exports = function(keyword, channel){
    let directory = path.resolve(__dirname, "..", channel)
    keys = keyword.split('.')
    let pageName = keys[0]+".md"
    let pagePath = path.resolve(directory,pageName)

    // 标题
    let page = fs.readFileSync(pagePath,'utf-8').replace(/(^|\n)\s*\#+\s*?(\S.*?)\#*?\s*?\n/g, function(text,$0,$1) {
        return $0 + colors.bold.green($1) + '\n'
    })

    // 代码
    page = page.replace(/\`{2,}.*?\n([\s\S]*?)\n\`{3,}/g,function(text,$0) {
        // 代码中的注释
        $0 = $0.replace(/(\/\/.*)\n/g, function(comment){
            return colors.italic.gray(comment)
        })
        return  colors.cyan($0) + '\n'
    })
    console.log(page)
}