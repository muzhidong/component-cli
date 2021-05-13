// 命令选项配置数据
const template = {
  name: "-t,--template",
  desc: "仅操作项目模板",
}

const component = {
  name: "-c,--component",
  desc: "仅操作组件",
}

const list = {
  name: "-l,--list",
  desc: "查看配置列表",
}

module.exports = {
  template,
  component,
  list,
}
