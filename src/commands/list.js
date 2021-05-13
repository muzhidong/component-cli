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
} = require('../config/options');

let {
  TYPES,
  selectType
} = require('../config/questions');

async function printList(type) {

  let res = await openDB.query({
    type,
  }, type === 'template' ? {
    name: 1
  } : {
    class: 1,
  });

  if (res.state === 'success') {

    let table = new Table({
      head: type === 'template' ? ['模板名称', '模板描述'] : ['类别', '组件名称', '组件描述'],
      colWidths: type === 'template' ? [30, 40] : [20, 30, 60],
    });

    let arr = res.data.map(item => {
      return type === 'template' ? [item.name, item.desc] : [item.class, item.name, item.desc]
    })

    table.push(...arr);

    console.log(chalk.hex('#3399FF')(table.toString()));

  } else {
    handleException(res.err);
  }
}

async function handleListAction(opt) {

  let {
    component = false,
      template = false,
  } = opt;

  if (component && !template) {
    printList('component');
    return;
  }

  if (!component && template) {
    printList('template');
    return;
  }

  let question = selectType;
  let res = await promptPromise([question]);
  if (res.state === 'success') {
    let scene = res.data.type === TYPES[0] ? 1 : 2;
    printList(scene === 1 ? 'template' : 'component');
  } else {
    handleException(res.err);
  }

}

module.exports = {
  cmd: "list",
  alias: 'ls',
  desc: "显示项目模板或组件列表信息",
  action: [{
      option: [template.name, template.desc],
    },
    {
      option: [component.name, component.desc],
      action: function(opt) {
        handleListAction(opt);
      },
    }
  ],
}
