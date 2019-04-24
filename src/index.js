#!/usr/bin/env node

const commander = require('commander')
const prompt = require('prompt')
const colors = require('colors')
const search = require('./utils/search')
const package = require('./../package.json')
commander.version(package.version,'-v, --version').option('-t, --channel [channel]','选择文档类目，可选项目有 nodejs ').action(function ({channel}) {
    let type = 'Node.js'
    switch(channel){
        case 'nodejs':type= 'Node.js';break;
        default : this.channel = 'nodejs';type = 'Node.js';
    }
    console.log(colors.rainbow("\n-############################# ") + colors.yellow.bold('当前处于 ' + type + ' 频道') + colors.rainbow(" ###############################-\n"))
})

commander.action(function(keyword){
    if(typeof keyword === 'string'){
        search(keyword, this.channel)
    }
})

commander.parse(process.argv)