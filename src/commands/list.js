const chalk = require('chalk');
const Table = require('cli-table3');

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
      head: ['类别', '组件名称', '组件描述'],
      colWidths: [20, 30, 60],
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
