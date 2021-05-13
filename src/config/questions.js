// 问题配置初始数据
const path = require('path');
const {
  dirIsExist,
  warn,
} = require('../helper');

const TYPES = ['templates[项目模板]', 'components[组件]'];
const CLASSES = ['UI型其他通用组件', 'UI型列表、条目组件', 'UI型名片组件', 'UI型图片处理组件', 'UI型对话框组件', 'UI型文本处理组件', 'UI型盒组件', 'UI型表单处理组件', 'UI型表格组件', '功能组件', '表单模板'];

const selectType = {
  type: 'list',
  name: 'type',
  message: '请选择您的操作：',
  default: '0',
  choices: TYPES,
};

/** ------------ select start --------------- */
const selectTpl = {
  type: 'rawlist',
  name: 'tpl',
  message: '请选择项目模板：',
  default: '0',
  choices: null,
};

const selectComponent = {
  type: 'rawlist',
  name: 'component',
  message: '请选择组件：',
  default: '0',
  choices: null,
  pageSize: 10,
};

const selectTargetPath = {
  type: 'input',
  name: 'targetPath',
  message: '请指定引入模板项目(组件)的目标目录：',
  // 默认当前目录
  default: path.resolve(),
  validate: function(val) {
    if (dirIsExist(val)) {
      return true;
    } else {
      warn(`  ${val}目录不存在，请重新选择`)
      return false;
    }
  },
};
/** ------------ select end --------------- */

/** ------------ add start --------------- */
const addTpl = {
  type: 'input',
  name: 'addTpl',
  message: '请输入新模板名称：',
  validate: function(val) {
    if (/^[a-z]{1}[-\w]{1,30}$/g.test(val)) {
      return true;
    } else {
      warn(`  输入名称不合法`);
      return false;
    }
  },
};

const addComponent = {
  type: 'input',
  name: 'addComponent',
  message: '请输入新组件名称：',
  validate: function(val) {
    if (/^[a-z]{1}[-\w]{1,30}$/g.test(val)) {
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

const addDesc = {
  type: 'input',
  name: 'addDesc',
  message: '请简要描述下该模板（组件）：',
};

const addSrcPath = {
  type: 'input',
  name: 'addSrcPath',
  message: '请输入新模板(组件)路径或链接：',
  validate: function(val) {
    if (/^http(s)?/g.test(val)) {
      return true;
    } else {
      if (dirIsExist(val)) {
        return true;
      } else {
        warn(`  ${val}目录不存在，请重新选择`)
        return false;
      }
    }
  },
};
/** ------------ add end --------------- */

/** ------------ del start --------------- */
const delTpl = {
  type: 'autocomplete',
  name: 'delTpl',
  message: '请搜索模板名称：',
  source: function(answersSoFar, input) {},
}

const delComponent = {
  type: 'autocomplete',
  name: 'delComponent',
  message: '请搜索组件名称：',
  source: function(answersSoFar, input) {},
}

/** ------------ del end --------------- */

/** ------------ update start --------------- */
const updateTpl = {
  type: 'autocomplete',
  name: 'updateTpl',
  message: '请搜索模板名称：',
  source: function(answersSoFar, input) {},
};

const updateComponent = {
  type: 'autocomplete',
  name: 'updateComponent',
  message: '请搜索组件名称：',
  source: function(answersSoFar, input) {},
};

const modifyName = {
  type: 'input',
  name: 'modifyName',
  message: '输入新名称：',
  default: undefined,
  validate: function(val) {
    if (/^[a-z]{1}[-\w]{1,30}$/g.test(val) || val === '') {
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
  message: '选择新的类别：',
  default: undefined,
  choices: CLASSES,
};

const updateSrcPath = {
  type: 'input',
  name: 'updateSrcPath',
  message: '请输入新模板(组件)路径或链接：',
  default: undefined,
  validate: function(val) {
    if (/^http(s)?/g.test(val)) {
      return true;
    } else {
      if (dirIsExist(val)) {
        return true;
      } else {
        warn(`  ${val}目录不存在，请重新选择`)
        return false;
      }
    }
  },
};

/** ------------ update end --------------- */

/** ------------ config start --------------- */
const tplCfgPath = {
  type: 'input',
  name: 'tplCfgPath',
  message: '请指定模板项目的存放目录：',
  validate: function(val) {
    if (dirIsExist(val)) {
      return true;
    } else {
      warn(`  ${val}目录不存在，请重新选择`)
      return false;
    }
  },
};

const cmpCfgPath = {
  type: 'input',
  name: 'cmpCfgPath',
  message: '请指定组件库的存放目录：',
  validate: function(val) {
    if (dirIsExist(val)) {
      return true;
    } else {
      warn(`  ${val}目录不存在，请重新选择`)
      return false;
    }
  },
};

/** ------------ config end --------------- */

module.exports = {

  TYPES,
  selectType,

  selectTpl,
  selectComponent,
  selectTargetPath,

  addTpl,
  addComponent,
  addDesc,
  addClass,
  addSrcPath,

  delTpl,
  delComponent,

  updateTpl,
  updateComponent,
  modifyName,
  modifyDesc,
  modifyClass,
  updateSrcPath,

  tplCfgPath,
  cmpCfgPath,
}
