const commander = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const {
  exec,
} = require('child_process');

// 添加命令
function addCommand(param = { cmd: "", alias: "", desc: "", action,}) {
  let {
    cmd = '',
    alias = '',
    desc = '',
    action,
  } = param;

  let tempCommander = commander.command(cmd).alias(alias).description(desc);

  let type = toString.call(action);
  switch (type) {
    case "[object Function]":
      tempCommander.action(action);
      break;
    case "[object Array]":
      for (let item of action) {
        tempCommander.option(...item.option);
        tempCommander.action(item.action);
      }
      break;
    default:
      break;
  }
}

// 打印帮助信息
function printHelp() {
  commander.help((info) => {
    console.info(info);
    return "请根据以上提供的的选项或命令使用工具。\r\n";
  });
}

// Promise化
function promptPromise(question) {
  return new Promise((resolve, reject) => {
    inquirer.prompt(question).then((res) => {
      resolve({
        state: 'success',
        data: res
      });
    }).catch(err => {
      resolve({
        state: 'error',
        err,
      });
    });
  })
}

function handleException(err) {
  // console.log(err);
  console.log(chalk.red.bold('程序出现异常，请重新执行'));
  process.exit(1);
}

function warn(content) {
  console.log(chalk.hex('#ffa500').bold(content));
}

function dirIsExist(dirPath) {
  try {
    // 读取源目录，检查源目录是否存在
    fs.readdirSync(dirPath);
    return true;
  } catch (e) {
    return false;
  }
}

function execCmd({ cmd, successCb, successParams, errorCb }) {
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      errorCb? errorCb(error): handleException(error);
    } else {
      successCb && successCb(successParams);
    }
  });
}

module.exports = {
  addCommand,
  printHelp,
  promptPromise,
  handleException,
  warn,
  dirIsExist,
  execCmd,
}
