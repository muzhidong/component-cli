const chalk = require('chalk');
const Table = require('cli-table3');

const {
  promptPromise,
  handleException,
} = require('../helper');

const openDB = require('../db/dao');

const {
  template,
  component,
  list,
} = require('../config/options');

const {
  tplCfgPath,
  cmpCfgPath,
} = require('../config/questions');

let tplPathData, cmpPathData;
async function queryConfig() {
  let res = await openDB.query({
    type: 'config',
  });

  if (res.state === 'success') {
    res = res.data;

    tplPathData = res.find(item => {
      return item.name === 'tplPath'
    });

    cmpPathData = res.find(item => {
      return item.name === 'cmpPath'
    });
  } else {
    handleException(res.err);
  }
}

async function addConfig(data) {
  let res = await openDB.add(data);
  if (res.state === 'success') {
    Promise.resolve();
  } else {
    handleException(res.err);
  }
}

async function updateConfig(oldData, newData) {
  let res = await openDB.update(oldData, {
    $set: newData
  });
  if (res.state === 'success') {
    Promise.resolve();
  } else {
    handleException(res.err);
  }
}

function output() {

  if (!tplPathData && !cmpPathData) {
    console.log(chalk.green('暂无配置'));
    return;
  }

  let table = new Table({
    head: ['配置名称', '值'],
    colWidths: [20, 100],
  });

  if (tplPathData) {
    table.push([tplPathData.name, tplPathData.path]);
  }

  if (cmpPathData) {
    table.push([cmpPathData.name, cmpPathData.path]);
  }

  console.log(chalk.hex('#3399FF')(table.toString()));
}

async function execConfigAction(scene) {

  let questions = [];
  switch (scene) {
    case 1:
      questions.push(tplCfgPath);
      break;
    case 2:
      questions.push(cmpCfgPath);
      break;
    case 0:
    default:
      questions.push(tplCfgPath, cmpCfgPath);
      break;
  }
  let res = await promptPromise(questions);
  if (res.state === 'success') {
    let {
      tplCfgPath,
      cmpCfgPath,
    } = res.data;

    if (tplCfgPath) {
      if (tplPathData && tplPathData.path) {
        await updateConfig({
          type: 'config',
          name: 'tplPath',
        }, {
          path: tplCfgPath,
        });
      } else {
        await addConfig({
          type: 'config',
          name: 'tplPath',
          path: tplCfgPath,
        });
      }
    }

    if (cmpCfgPath) {
      if (cmpPathData && cmpPathData.path) {
        await updateConfig({
          type: 'config',
          name: 'cmpPath',
        }, {
          path: cmpCfgPath,
        });
      } else {
        await addConfig({
          type: 'config',
          name: 'cmpPath',
          path: cmpCfgPath,
        });
      }
    }

    console.log(chalk.green('配置完毕'));

  } else {
    handleException(res.err);
  }
}

async function handleConfigAction(opt) {

  let {
    component = false,
      template = false,
      list = false,
  } = opt;

  await queryConfig();

  if (list) {
    output();
    return;
  }

  if (component && !template) {
    execConfigAction(2);
    return;
  }

  if (!component && template) {
    execConfigAction(1);
    return;
  }

  execConfigAction(0);
}

module.exports = {
  cmd: "config",
  desc: "配置模板项目(组件库)的存放目录",
  action: [{
    option: [template.name, template.desc],
  }, {
    option: [component.name, component.desc],
  }, {
    option: [list.name, list.desc],
    action: function(opt) {
      handleConfigAction(opt);
    },
  }],
}
