const {
  exec,
} = require('child_process');

const chalk = require('chalk');
const ora = require('ora');
const download = require('download-git-repo');

const {
  promptPromise,
  handleException,
} = require('../helper');

const openDB = require('../db/dao');

const {
  checkConfigPath
} = require('../db/db.util.js');

// 选项配置数据
const {
  template,
  component,
} = require('../config/options');

// 问题配置数据
let {
  TYPES,
  selectType,
  selectTpl,
  selectComponent,
  selectTargetPath,
} = require('../config/questions');

// 初始化数据
let tplData = null;
let componentData = null;

async function init() {

  let res = await openDB.query();

  if (res.state === 'success') {

    let data = res.data;

    tplData = data.filter(item => {
      return item.type === 'template'
    });
    selectTpl.choices = tplData.map(item => item.name);

    componentData = data.filter(item => {
      return item.type === 'component'
    });
    selectComponent.choices = componentData.map(item => item.name);

  } else {
    handleException(res.err);
  }
}

function doCopy(src, dest) {

  let spinner = ora({
    text: `开始下载模板或引入组件...\r\n`,
    color: 'yellow',
  }).start();

  exec(`cp -rf ${src} ${dest}`, function(error, stdout, stderr) {
    if (error) {
      spinner.fail('下载模板或引入组件失败');
      handleException(error);
    }
    spinner.succeed('下载模板或引入组件成功');
  });
}

function doDownload(url, dest) {

  let spinner = ora({
    text: `开始下载模板或引入组件...\r\n下载需要一定时间，请耐心等待...`,
    color: 'yellow',
  }).start();

  download(`direct:${url}`, dest, {
    clone: true
  }, function(err) {
    if (err) {
      spinner.fail('下载模板或引入组件失败，请检查当前路径是否与该模板重名的文件夹，有则将其移出');
      handleException(err);
    }
    if (/.*\.git$/g.test(url)) {
      // 删除.git文件夹
      let name = url.split('/');
      name = name[name.length - 1].replace('.git', '');
      exec(`rm -rf ${dest}/${name}/.git`, function(error, stdout, stderr) {
        if (error) {
          spinner.fail('请手动删除模板中.git文件夹');
          handleException(err);
        }
        spinner.succeed('下载模板或引入组件成功');
      })
    } else {
      spinner.succeed('下载模板或引入组件成功');
    }
  })
}

async function execSelectAction(scene) {

  let result = await checkConfigPath(scene);
  if (!result) {
    console.log(chalk.yellow(`请先配置${scene === 1?'模板项目':'组件库'}的存放目录`));
    return;
  }

  res = await promptPromise([scene === 1 ? selectTpl : selectComponent, selectTargetPath]);

  if (res.state === 'success') {
    res = res.data;

    let info = scene === 1 ? tplData.find(item => item.name === res.tpl) : componentData.find(item => item.name === res.component);

    if (/^http(s)?:\/\//g.test(info.path)) {
      // 外链则下载
      doDownload(info.path, `${res.targetPath}/${info.name.substr(0,3) === 'kg-'? 'templates': info.name}`);
    } else {
      // 路径则复制
      doCopy(`${result.path}/${info.path}`, `${res.targetPath}/${info.name.substr(0,3) === 'kg-'? 'templates': info.name}`);
    }

  } else {
    handleException(res.err);
  }

}

async function handleSelectAction(opt) {

  await init();

  let {
    component = false,
      template = false,
  } = opt;

  if (component && !template) {
    execSelectAction(2);
    return;
  }

  if (!component && template) {
    execSelectAction(1);
    return;
  }

  let res = await promptPromise([selectType]);
  if (res.state === 'success') {
    execSelectAction(res.data.type === TYPES[0] ? 1 : 2);
  } else {
    handleException(res.err);
  }

}

module.exports = {
  cmd: "select",
  desc: "选择项目模板或组件",
  action: [{
    option: [template.name, template.desc],
  }, {
    option: [component.name, component.desc],
    // ???最后一个action有效
    action: function(opt) {
      handleSelectAction(opt);
    },
  }, ],
}
