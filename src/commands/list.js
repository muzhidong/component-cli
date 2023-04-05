const chalk = require('chalk');
const Table = require('../libs/cli-table3');

const {
  handleException,
} = require('../helper');

const openDB = require('../db/dao');

async function handleListAction(type = 'component') {

  let res = await openDB.query({
    type,
  }, {
    class: 1,
  });

  if (res.state === 'success') {

    let table = new Table({
      head: ['可应用的框架类型', '组件名称', '组件说明'],
      colWidths: [20, 30, 60],
      wordWrap: true,
      headHAlign: 'center',
    });

    let arr = res.data.map(item => {
      return [item.class, item.name, item.desc]
    })

    table.push(...arr);

    console.log(chalk.hex('#3399FF')(table.toString()));

  } else {
    handleException(res.err);
  }
}

module.exports = {
  cmd: "list",
  alias: 'ls',
  desc: "显示组件列表信息",
  action: function() {
    handleListAction();
  },
}
