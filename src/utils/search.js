const fs = require('fs')
const colors = require('colors')
const path = require('path')

module.exports = function(keyword, channel){
    let directory = path.resolve(__dirname, "..", "..", channel)
    keys = keyword.split('.')
    let pageName = keys[0]+".md"
    let pagePath = path.resolve(directory,pageName)

    let page = fs.readFileSync(pagePath,'utf-8')

    // 代码
    page = page.replace(/\`{3,}.*?\n([\s\S]*?)\n\`{3,}/g,function(text,$0) {
        // 代码中的注释
        $0 = $0.replace(/(\/\/.*)\n/g, function(comment){
            return colors.italic.gray(comment)
        })
        return  colors.cyan($0) + '\n'
    })

    // 重点
    page = page.replace(/\`([^\`]*?)\`/g,function(text,$0) {
        return  colors.magenta($0)
    })

    // 标题 5
    page = page.replace(/(^|\n)\s*\#{5}\s*?(\S.*?)\#*?\s*?\n/g, function(text,$0,$1){
        return '\n' + $0 + colors.bold.yellow('▷ ' + $1) + '\n'
    })

    // 标题 4
    page = page.replace(/(^|\n)\s*\#{4}\s*?(\S.*?)\#*?\s*?\n/g, function(text,$0,$1) {
        return '\n' + $0 + colors.bold.green('◎ ' + $1) + '\n'
    })

    // 标题 3
    page = page.replace(/(^|\n)\s*\#{3}\s*?(\S.*?)\#*?\s*?\n/g, function(text,$0,$1) {
        return '\n' + $0 + colors.bold.blue($1) + '\n'
    })

    // 标题 2
    page = page.replace(/(^|\n)\s*\#{2}\s*?(\S.*?)\#*?\s*?\n/g, function(text,$0,$1) {
        return '\n' + $0 + colors.bold.blue.underline($1) + '\n'
    })

    // 标题 1
    page = page.replace(/(^|\n)\s*\#{1}\s*?(\S.*?)\#*?\s*?\n/g, function(text,$0,$1) {
        return '\n' + $0 + colors.bold.red($1) + '\n'
    })

    console.log(page)
}