// 问题配置初始数据
const path = require('path');
const {
  dirIsExist,
  warn,
} = require('../helper');

// 内置类别
const CLASSES = ['自定义', 'react', 'vue', 'ng', 'umi', 'uni'];

/** ------------ select start --------------- */
const selectAppliedFrameworkType = {
  type: 'autocomplete',
  name: 'frameworkType',
  message: '搜索或选择要应用的框架类型：',
  source: function(answersSoFar, input) {},
};

const selectComponent = {
  type: 'autocomplete',
  name: 'component',
  message: '搜索或选择组件：',
  source: function(answersSoFar, input) {},
};

const selectTargetPath = {
  type: 'input',
  name: 'targetPath',
  message: '指定引入组件的目标绝对路径（默认当前路径）：',
  default: path.resolve(),
  validate: function(val) {
    if (dirIsExist(val)) {
      return true;
    } else {
      warn(`  ${val}路径不存在，请重新选择`)
      return false;
    }
  },
};
/** ------------ select end --------------- */

/** ------------ add start --------------- */
const addComponent = {
  type: 'input',
  name: 'addComponent',
  message: '请输入组件名称：',
  validate: function(val) {
    if (/^[A-Za-z_][-\w]*$/g.test(val)) {
      return true;
    } else {
      warn(`  输入名称不合法`);
      return false;
    }
  },
};

const addClass = {
  type: 'list',
  name: 'addClass',
  message: '请选择组件类别：',
  choices: CLASSES,
};

const setClass = {
  type: 'input',
  name: 'setClass',
  message: '请设置组件类别：',
  validate: function(val) {
    if (val === '') {
      warn(`  不能为空`);
      return false;
    } 
    return true;
  }
};

const addDesc = {
  type: 'input',
  name: 'addDesc',
  message: '请简要描述组件：',
};

const addSrcPath = {
  type: 'input',
  name: 'addSrcPath',
  message: '请输入组件链接：',
  validate: function(val) {
    if (/^http(s)?/g.test(val)) {
      return true;
    } else {
      if (dirIsExist(val)) {
        return true;
      } else {
        warn(`  ${val}路径不存在，请重新选择`)
        return false;
      }
    }
  },
};
/** ------------ add end --------------- */

/** ------------ del start --------------- */
const delComponent = {
  type: 'autocomplete',
  name: 'delComponent',
  message: '请搜索组件名称：',
  source: function(answersSoFar, input) {},
}

/** ------------ del end --------------- */

/** ------------ update start --------------- */
const updateComponent = {
  type: 'autocomplete',
  name: 'updateComponent',
  message: '请搜索组件名称：',
  source: function(answersSoFar, input) {},
};

const modifyName = {
  type: 'input',
  name: 'modifyName',
  message: '输入名称：',
  default: undefined,
  validate: function(val) {
    if (/^[A-Za-z_][-\w]*$/g.test(val) || val === '') {
      return true;
    } else {
      warn(`  输入名称不合法`);
      return false;
    }
  }
};

const modifyDesc = {
  type: 'input',
  name: 'modifyDesc',
  message: '修改描述：',
  default: undefined,
};

const modifyClass = {
  type: 'list',
  name: 'modifyClass',
  message: '选择类别：',
  default: undefined,
  choices: CLASSES,
};

const updateSrcPath = {
  type: 'input',
  name: 'updateSrcPath',
  message: '请输入组件路径或链接：',
  default: undefined,
  validate: function(val) {
    if (/^http(s)?/g.test(val)) {
      return true;
    } else {
      if (dirIsExist(val)) {
        return true;
      } else {
        warn(`  ${val}路径不存在，请重新选择`)
        return false;
      }
    }
  },
};

/** ------------ update end --------------- */

module.exports = {
  selectAppliedFrameworkType,
  selectComponent,
  selectTargetPath,

  addComponent,
  addClass,
  setClass,
  addDesc,
  addSrcPath,

  delComponent,

  updateComponent,
  modifyName,
  modifyDesc,
  modifyClass,
  updateSrcPath,
}
