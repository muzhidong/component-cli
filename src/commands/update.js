const inquirer = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
const ora = require('ora');

const {
  promptPromise,
  handleException,
} = require('../helper');

const openDB = require('../db/dao');

const {
  updateComponent,
  modifyName,
  modifyDesc,
  modifyClass,
  setClass,
  updateSrcPath,
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
    updateComponent.source = function(answersSoFar, input) {
      let component = componentData.filter(item => item.name.search(input) > -1);
      return Promise.resolve(component);
    };

  } else {
    handleException(res.err);
  }
}

async function updateData(params) {

  let {
    updateComponent,
    modifyName,
    modifyClass,
    modifyDesc,
    updateSrcPath,
    spinner,
  } = params;

  let res = await openDB.update(componentData.find(component => component.name === updateComponent), {
    type: 'component',
    name: modifyName,
    'class': modifyClass,
    desc: modifyDesc,
    path: updateSrcPath,
  });

  if (res.state === 'success') {
    spinner.succeed('更新成功');
  } else {
    spinner.fail('更新失败');
    handleException(res.err);
  }
}

async function execUpdateAction() {
  let res = await promptPromise([updateComponent]);
  if (res.state === 'success') {
    const {
      updateComponent,
    } = res.data;

    // 初始化值
    const target = componentData.find(component => component.name === updateComponent)|| {};
    modifyName.default = target.name;
    modifyClass.default = target.class;
    modifyDesc.default = target.desc;
    updateSrcPath.default = target.path;

    res = await promptPromise([modifyName, modifyClass]);
    if(res.state === 'success'){
      const {
        modifyName,
        modifyClass,
      } = res.data;

      // 是否是自定义类别
      const nextQuestions = [modifyDesc, updateSrcPath];
      if(modifyClass === '自定义'){
        nextQuestions.unshift(setClass);
      }
  
      res = await promptPromise(nextQuestions);
      if (res.state === 'success') {
        const {
          setClass,
          modifyDesc, 
          updateSrcPath
        } = res.data;

        let spinner = ora({
          text: `开始更新模板或组件...\r\n`,
          color: 'yellow',
        }).start();
 
        updateData({
          updateComponent,
          modifyName,
          modifyClass: setClass || modifyClass,
          modifyDesc,
          updateSrcPath,
          spinner,
        });

      } else {
        handleException(res.err);
      }
    } else {
      handleException(res.err);
    }
  } else {
    handleException(res.err);
  }
}

async function handleUpdateAction() {

  await init();

  execUpdateAction();

}

module.exports = {
  cmd: "update",
  alias: "up",
  desc: "更新组件",
  action: function() {
    handleUpdateAction();
  },
}
