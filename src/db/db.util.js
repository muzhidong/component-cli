const {
  handleException,
} = require('../helper');

const openDB = require('./dao');

async function checkConfigPath(scene) {

  let name;
  switch (scene) {
    case 1:
      name = 'tplPath';
      break;
    case 2:
      name = 'cmpPath';
      break;
    default:
      break;
  }

  let res = await openDB.query({
    type: 'config',
    name,
  });
  if (res.state === 'success') {
    return Promise.resolve(res.data.length > 0 && res.data[0]);
  } else {
    handleException(res.err);
  }
}

module.exports = {
  checkConfigPath
}
