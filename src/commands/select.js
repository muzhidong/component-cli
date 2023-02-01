const {
  exec,
} = require('child_process');

const ora = require('ora');
const download = require('download-git-repo');

const {
  promptPromise,
  handleException,
} = require('../helper');

const openDB = require('../db/dao');

// 问题配置数据
let {
  selectComponent,
  selectTargetPath,
} = require('../config/questions');

// 初始化数据
let componentData = null;

async function init() {

  let res = await openDB.query();

  if (res.state === 'success') {

    let data = res.data;

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
    text: `开始引入组件...\r\n`,
    color: 'yellow',
  }).start();

  exec(`cp -rf ${src} ${dest}`, function(error, stdout, stderr) {
    if (error) {
      spinner.fail('引入组件失败');
      handleException(error);
    }
    spinner.succeed('引入组件成功');
  });
}

function doDownload(url, dest) {

  let spinner = ora({
    text: `开始引入组件...\r\n下载需要一定时间，请耐心等待...`,
    color: 'yellow',
  }).start();

  download(`direct:${url}`, dest, {
    clone: true
  }, function(err) {
    if (err) {
      spinner.fail('引入组件失败，请检查当前路径是否有与组件重名的文件夹');
      handleException(err);
    }
    if (/.*\.git$/g.test(url)) {
      // 删除.git文件夹
      let name = url.split('/');
      name = name[name.length - 1].replace('^(.*)\.git.*$', '$1');
      exec(`rm -rf ${dest}/${name}/.git`, function(error, stdout, stderr) {
        if (error) {
          spinner.fail('请手动删除.git文件夹');
        }
        spinner.succeed('引入组件成功');
      })
    } else {
      spinner.succeed('引入组件成功');
    }
  })
}

async function execSelectAction() {

  const res = await promptPromise([selectComponent, selectTargetPath]);

  if (res.state === 'success') {
    res = res.data;

    let info = componentData.find(item => item.name === res.component);

    if (/^http(s)?:\/\//g.test(info.path)) {
      // 外链则下载。不支持npm下载，初衷是组件是以源码的方式引入，而非模块，方便调整
      doDownload(info.path, res.targetPath);
    } else {
      // 路径则复制
      doCopy(info.path, res.targetPath);
    }

  } else {
    handleException(res.err);
  }

}

async function handleSelectAction() {

  await init();

  execSelectAction();

}

module.exports = {
  cmd: "select",
  desc: "选择组件",
  action: function() {
    handleSelectAction();
  },
}
