const {
  exec,
} = require('child_process');
const inquirer = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
const ora = require('ora');

const {
  promptPromise,
  handleException,
  execCmd
} = require('../helper');

const openDB = require('../db/dao');

// 问题配置数据
let {
  selectAppliedFrameworkType,
  selectComponent,
  selectTargetPath,
} = require('../config/questions');

// 初始化数据
let componentData = null;

async function init() {

  inquirer.registerPrompt('autocomplete', autocomplete);

  const {
    state,
    data,
    err,
  } = await openDB.query();
  if (state === 'success') {

    componentData = data.filter(item => {
      return item.type === 'component'
    });

    let types = Array.from(new Set(data.filter(item => !!item.class).map(item => item.class)));
    selectAppliedFrameworkType.pageSize = types.length;
    selectAppliedFrameworkType.source = function(answersSoFar, input) {
      return Promise.resolve(types.filter(item => item.search(input) > -1));
    };

  } else {
    handleException(err);
  }
}

function doCopy(src, dest) {
  let spinner = ora({
    text: `开始引入组件...\r\n`,
    color: 'yellow',
  }).start();

  execCmd({
    cmd: `cp -rf ${src} ${dest}`,
    successCb: function () {
      spinner.succeed('引入组件成功');
    }
  })
}

function handleTemplateFromGit(cmd, dest, spinner){
  const repoName = cmd.replace(/.*\/(.*)\.git.*/, '$1');
  const command = `rm -rf ${repoName}/.git && mv ${repoName}/* ${dest} && rm -rf ${repoName}`;
  execCmd({
    cmd: command,
    successCb: function () {
      spinner.succeed('引入组件成功');
    }
  })
}

function doDownload(url, dest) {

  let spinner = ora({
    text: `开始引入组件...\r\n下载需要一定时间，请耐心等待...`,
    color: 'yellow',
  }).start();
  execCmd({
    cmd: `git clone ${url}`,
    successCb: function() {
      // 删除.git文件夹，并将下载的根文件夹命名为分支名
      handleTemplateFromGit(url, dest, spinner);
    },
    errorCb: function () { 
      spinner.fail('下载组件失败，重试一下');
      process.exit(1);
    }
  })
}

async function execSelectAction() {

  const {
    state,
    data,
    err,
  } = await promptPromise([selectAppliedFrameworkType,]);

  if (state === 'success') {
    const {
      frameworkType
    } = data;

    const components = componentData.filter(item => item.class === frameworkType).map(item => item.name);
    selectComponent.pageSize = components.length;
    selectComponent.source = function(answersSoFar, input) {
      return Promise.resolve(components.filter(item => item.search(input) > -1));
    };

    const res = await promptPromise([selectComponent, selectTargetPath]);
    if(res.state === 'success'){  
      const {
        component,
        targetPath
      } = res.data;
      const info = componentData.find(item => item.name === component);
      if (/^http(s)?:\/\//g.test(info.path)) {
        // 外链则下载。不支持npm下载，初衷是组件是以源码的方式引入，而非模块，方便调整
        doDownload(info.path, targetPath);
      } else {
        // 路径则复制
        doCopy(info.path, targetPath);
      }
    } else {
      handleException(res.err);
    }
  } else {
    handleException(err);
  }
}

async function handleSelectAction() {

  await init();

  execSelectAction();

}

module.exports = {
  cmd: "select",
  desc: "选择组件",
  action: function() {
    handleSelectAction();
  },
}
