const ora = require('ora');

const {
  promptPromise,
  handleException,
  execCmd,
  dirIsExist,
} = require('../helper');

const openDB = require('../db/dao');

const {
  checkConfigPath
} = require('../db/db.util.js');

const {
  template,
  component,
} = require('../config/options');

const {
  TYPES,
  selectType,

  addTpl,
  addComponent,
  addClass,
  addDesc,
  addSrcPath,
} = require('../config/questions');

const {
  COMPONENT_PATH_PREFIX,
} = require('../config/constant');

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

async function rename(params) {

  let {
    // 输入的名称
    inputName,

    srcPath,
    targetPath,

    type,
    desc,
    path,
    _class,
    spinner,

    useTemp,
  } = params;

  // 路径下的名称
  let srcName = srcPath.split('/');
  srcName = srcName[srcName.length - 1];

  if (srcName !== inputName) {
    // 路径下的名称与输入的名称不一致时，需重命名
    let current;
    let update;
    let cmd;

    if (useTemp) {
      current = `${targetPath}/temp/${srcName}`;
      update = `${targetPath}/temp/${inputName}`;
      cmd = `mv ${current} ${update} && cp -rf ${update} ${targetPath} && rm -rf ${`${targetPath}/temp`}`;
    } else {
      current = `${targetPath}/${srcName}`;
      update = `${targetPath}/${inputName}`;
      cmd = `mv ${current} ${update} `;
    }
    execCmd(cmd, addData, {
      type,
      name: inputName,
      desc,
      path,
      _class,
      spinner
    });
  } else {
    addData({
      type,
      name: inputName,
      desc,
      path,
      _class,
      spinner
    })
  }
}

function copy(src, dest, cb, params) {

  // 路径下的名称
  let srcName = src.split('/');
  srcName = srcName[srcName.length - 1];

  if (dirIsExist(`${dest}/${srcName}`)) {
    // 先创建与目标路径同级的temp文件夹并放到该处，再重命名，最后从temp文件夹复制到目标路径，删除temp文件夹
    execCmd(`mkdir ${`${dest}/temp`} && cp -rf ${src} ${`${dest}/temp`}`, cb, {
      ...params,
      useTemp: true,
    });
  } else {
    execCmd(`cp -rf ${src} ${dest}`, cb, params);
  }

}

async function execAddAction(scene) {

  let result = await checkConfigPath(scene);
  if (!result) {
    console.log(chalk.yellow(`请先配置${scene === 1?'模板项目':'组件库'}的存放目录`));
    return;
  }

  let arr = scene === 1 ? [addTpl] : [addComponent, addClass];
  let res = await promptPromise([...arr, addDesc, addSrcPath]);
  if (res.state === 'success') {

    let {
      addTpl,
      addComponent,
      addDesc,
      addSrcPath,
      addClass,
    } = res.data;

    let spinner = ora({
      text: `开始添加模板或组件...\r\n`,
      color: 'yellow',
    }).start();

    if (!/^http(s)?/g.test(addSrcPath)) {
      // 若是本地代码，则复制到模板项目或组件库项目中
      let targetPath;
      if (addComponent) {
        targetPath = `${result.path}/${COMPONENT_PATH_PREFIX}`;
        copy(addSrcPath, targetPath, rename, {
          inputName: addComponent,
          srcPath: addSrcPath,
          targetPath,
          type: 'component',
          _class: addClass,
          desc: addDesc,
          path: `${COMPONENT_PATH_PREFIX}/${addComponent}`,
          spinner,
        });

      } else {
        targetPath = result.path;
        copy(addSrcPath, targetPath, rename, {
          inputName: addTpl,
          srcPath: addSrcPath,
          targetPath,
          type: 'template',
          desc: addDesc,
          path: addTpl,
          spinner,
        });
      }
    } else {
      let data = {
        name: addTpl || addComponent,
        desc: addDesc,
        path: addSrcPath,
        type: addTpl ? 'template' : 'component',
        spinner,
      }
      if (addClass) {
        data._class = addClass;
      }
      addData(data);
    }
  } else {
    handleException(res.err);
  }
}

async function handleAddAction(opt) {

  let {
    component = false,
      template = false,
  } = opt;

  if (component && !template) {
    execAddAction(2);
    return;
  }

  if (!component && template) {
    execAddAction(1);
    return;
  }

  let res = await promptPromise([selectType]);
  if (res.state === 'success') {
    let scene = res.data.type === TYPES[0] ? 1 : 2;
    execAddAction(scene);
  } else {
    handleException(res.err);
  }

}

module.exports = {
  cmd: "add",
  desc: "添加项目模板或组件",
  action: [{
      option: [template.name, template.desc],
    },
    {
      option: [component.name, component.desc, ],
      action: function(opt) {
        handleAddAction(opt);
      },
    }
  ],
}
