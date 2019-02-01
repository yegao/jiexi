#!/usr/bin/env node

const commander = require('commander')
const colors = require('colors')
const search = require('./utils/search')

commander.version('1.0.0','-v, --version').option('-t, --channel [channel]','选择文档类目，可选项目有 nodejs ').action(function ({channel}) {
    switch(channel){
        case 'nodejs':console.log(colors.green.bold('进入') + colors.yellow.bold('Node.js') + colors.green.bold('频道...'));break;
        default : this.channel = 'nodejs';console.log(colors.yellow.bold('当前正在Node.js频道...'))
    }
    console.log(colors.rainbow("\n-##########################################-#################-\n\n"))
})

commander.action(function(keyword){
    if(typeof keyword === 'string'){
        search(keyword, this.channel)
    }
})




















commander.parse(process.argv)