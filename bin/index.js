#!/usr/bin/env node

const commander = require('commander');

const {
  version,
} = require('../package');

const {
  addCommand,
  printHelp,
} = require("../src/helper");

const commands = require("../src/commands/index");

const {
  initDB
} = require("../src/db/initDB");

async function init() {

  // 初始化数据库
  await initDB();

  // 设置版本
  commander.version(version);

  // 添加命令
  for (let key in commands) {
    addCommand(commands[key]);
  }

  // 解析命令
  commander.parse(process.argv);

  // 错误命令事件监听
  commander.on('command:*', function() {
    printHelp();
  });

  // 仅输入kg-cli时的处理
  if (process.argv.length === 2) {
    printHelp();
  };
}

init();
