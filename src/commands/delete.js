const inquirer = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
const ora = require('ora');

const {
  promptPromise,
  handleException,
} = require('../helper');

const openDB = require('../db/dao');

const {
  delComponent,
} = require('../config/questions');

let componentData;

async function init() {

  inquirer.registerPrompt('autocomplete', autocomplete);

  let res = await openDB.query();
  if (res.state === 'success') {
    let data = res.data;

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

async function execDelAction() {

  let res = await promptPromise([delComponent]);
  if (res.state === 'success') {
    let {
      delComponent,
    } = res.data;

    let spinner = ora({
      text: `开始删除组件...\r\n`,
      color: 'yellow',
    }).start();

    let info = componentData.find(item => item.name === delComponent);

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

async function handleDelAction() {

  await init();

  execDelAction();

}

module.exports = {
  cmd: "delete",
  alias: "del",
  desc: "删除组件",
  action: function() {
    handleDelAction();
  },
}
