const inquirer = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
const ora = require('ora');

const {
  exec,
} = require('child_process');

const {
  promptPromise,
  handleException,
} = require('../helper');

const openDB = require('../db/dao');

const {
  checkConfigPath
} = require('../db/db.util.js');

const {
  template,
  component,
} = require('../config/options');

const {
  TYPES,
  selectType,

  delTpl,
  delComponent,
} = require('../config/questions');

const {
  COMPONENT_PATH_PREFIX
} = require('../config/constant');

let tplData;
let componentData;

async function init() {

  inquirer.registerPrompt('autocomplete', autocomplete);

  let res = await openDB.query();
  if (res.state === 'success') {
    let data = res.data;

    tplData = data.filter(item => {
      return item.type === 'template'
    });
    delTpl.source = function(answersSoFar, input) {
      let tpl = tplData.filter(item => item.name.search(input) > -1);
      return Promise.resolve(tpl);
    };

    componentData = data.filter(item => {
      return item.type === 'component'
    });
    delComponent.source = function(answersSoFar, input) {
      let component = componentData.filter(item => item.name.search(input) > -1);
      return Promise.resolve(component);
    };

  } else {
    handleException(res.err);
  }
}

function rm(target) {

  exec(`rm -rf ${target}`, function(error, stdout, stderr) {
    if (error) {
      handleException(error);
    }
  })

}

async function execDelAction(scene) {

  let result = await checkConfigPath(scene);
  if (!result) {
    console.log(chalk.yellow(`请先配置${scene === 1?'模板项目':'组件库'}的存放目录`));
    return;
  }

  let res = await promptPromise([scene === 1 ? delTpl : delComponent]);
  if (res.state === 'success') {
    let {
      delTpl,
      delComponent,
    } = res.data;

    let spinner = ora({
      text: `开始删除模板或组件...\r\n`,
      color: 'yellow',
    }).start();

    let info = scene === 1 ? tplData.find(item => item.name === delTpl) : componentData.find(item => item.name === delComponent);

    if (!/^http(s)?:\/\//g.test(info.path)) {
      // 若是本地，则模板项目或组件库项目中删除；
      rm(scene === 1 ? `${result.path}/${info.name}` : `${result.path}/${COMPONENT_PATH_PREFIX}/${info.name}`);
    }

    // 删除数据库数据
    res = await openDB.remove(info);
    if (res.state === 'success') {
      spinner.succeed('删除成功');
    } else {
      spinner.fail('删除失败');
      handleException(res.err);
    }

  } else {
    handleException(res.err);
  }
}

async function handleDelAction(opt) {

  await init();

  let {
    component = false,
      template = false,
  } = opt;

  if (component && !template) {
    execDelAction(2);
    return;
  }

  if (!component && template) {
    execDelAction(1);
    return;
  }

  let res = await promptPromise([selectType]);
  if (res.state === 'success') {
    let scene = res.data.type === TYPES[0] ? 1 : 2;
    execDelAction(scene);
  } else {
    handleException(res.err);
  }

}

module.exports = {
  cmd: "delete",
  alias: "del",
  desc: "删除项目模板或组件",
  action: [{
      option: [template.name, template.desc],
    },
    {
      option: [component.name, component.desc],
      action: function(opt) {
        handleDelAction(opt);
      },
    }
  ],
}
