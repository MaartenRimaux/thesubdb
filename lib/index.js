'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getHash = function getHash(file) {
  var readSize = 64 * 1024;
  var buffer = _fsExtra2.default.readFileSync(file);
  var contentLength = buffer.byteLength;
  var start = Buffer.alloc(readSize);
  var end = Buffer.alloc(readSize);
  buffer.copy(start, 0, 0, readSize);
  buffer.copy(end, 0, contentLength - readSize);
  return (0, _md2.default)(Buffer.concat([start, end]));
};

var availLan = function availLan(file) {
  return new Promise(function (resolve, reject) {
    var hash = getHash(_path2.default.resolve(__dirname, file));
    var options = {
      url: 'http://api.thesubdb.com/?action=search&hash=' + hash,
      headers: {
        'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)'
      }
    };
    (0, _requestPromise2.default)(options).then(function (res) {
      if (res.statusCode === 200) {
        resolve(res.body.split(','));
      } else {
        reject(new Error('Received status code: ' + res.statusCode));
      }
    }).catch(function (res) {
      reject(new Error('Received status code: ' + res.statusCode));
    });
  });
};

var downSub = function downSub(lang, file) {
  return new Promise(function (resolve, reject) {
    var hash = getHash(_path2.default.resolve(__dirname, file));
    var options = {
      url: 'http://api.thesubdb.com/?action=download&hash=' + hash + '&language=' + lang,
      headers: {
        'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)'
      }
    };
    (0, _requestPromise2.default)(options).then(function (res) {
      if (res.statusCode === 200) {
        _fsExtra2.default.writeFile(_path2.default.basename(file, _path2.default.extname(file)) + '.srt', res.body).then(resolve).catch(reject);
      } else {
        reject(new Error('Received status code: ' + res.statusCode));
      }
    }).catch(function (res) {
      reject(new Error('Received status code: ' + res.statusCode));
    });
  });
};

module.exports = {
  downSub: downSub,
  availLan: availLan
};