const ora = require('ora');

const {
  promptPromise,
  handleException,
} = require('../helper');

const openDB = require('../db/dao');

const {
  addComponent,
  addClass,
  setClass,
  addDesc,
  addSrcPath,
} = require('../config/questions');

async function addData(params) {

  let {
    type,
    name,
    desc,
    path,
    _class,
    spinner,
  } = params;

  // 插入一条数据到数据库
  res = await openDB.add({
    name,
    desc,
    type,
    path,
    class: _class
  });
  if (res.state === 'success') {
    spinner.succeed('添加成功');
  } else {
    spinner.fail('添加失败');
    handleException(res.err);
  }
}

async function execAddAction() {
  let res = await promptPromise([addComponent, addClass]);
  if (res.state === 'success') {
    
    const {
      addComponent,
      addClass,
    } = res.data;

    const nextQuestions = [addDesc, addSrcPath];
    if(addClass === '自定义'){
      nextQuestions.unshift(setClass);
    }
    res = await promptPromise(nextQuestions);

    if(res.state === 'success'){
      const {
        setClass,
        addDesc, 
        addSrcPath
      } = res.data;

      const spinner = ora({
        text: `开始添加组件...\r\n`,
        color: 'yellow',
      }).start();

      const data = {
        name: addComponent,
        desc: addDesc,
        path: addSrcPath,
        type: 'component',
        _class: setClass || addClass,
        spinner,
      }
      addData(data);
    } else {
      handleException(res.err);
    }

  } else {
    handleException(res.err);
  }
}

module.exports = {
  cmd: "add",
  desc: "添加组件",
  action: function() {
    execAddAction();
  },
}
