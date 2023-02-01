const inquirer = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
const ora = require('ora');

const {
  promptPromise,
  handleException,
  execCmd,
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

  const data = {};
  if(modifyName){
    data.name = modifyName;
  }
  if (modifyClass) {
    data.class = modifyClass;
  }
  if (modifyDesc) {
    data.desc = modifyDesc;
  }
  if(updateSrcPath){
    data.path = updateSrcPath;
  }

  let res = await openDB.update({
    name: updateComponent,
    type: 'component',
  }, {
    $set: data,
  });

  if (res.state === 'success') {
    spinner.succeed('更新成功');
  } else {
    spinner.fail('更新失败');
    handleException(res.err);
  }
}

async function execUpdateAction() {
  let res = await promptPromise([updateComponent, modifyName, modifyClass]);
  if (res.state === 'success') {
    setTimeout(async () => {
      const {
        updateComponent,
        modifyName,
        modifyClass,
      } = res.data;
      
      const nextQuestions = [modifyDesc, updateSrcPath];
      if(modifyClass === '自定义'){
        nextQuestions.unshift(setClass);
      }
      res = await promptPromise(nextQuestions);

      if (res.state === 'success') {
        const {
          setClass,
          modifyClass, 
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
      
    }, 0);
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
