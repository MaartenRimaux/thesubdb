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

var readFile = function readFile(file, start, end) {
  return new Promise(function (resolve, reject) {
    var data = void 0;
    var readStream = _fsExtra2.default.createReadStream(file, { start: start, end: end });
    readStream.on('data', function (chunk) {
      if (!data) {
        data = chunk;
      } else {
        data = Buffer.concat([data, chunk]);
      }
    }).on('end', function () {
      return resolve(data);
    }).on('error', function (error) {
      reject(error);
    });
  });
};

var getHash = function getHash(file) {
  return new Promise(function (resolve, reject) {
    var readSize = 64 * 1024;
    var contentLength = _fsExtra2.default.statSync(file).size;
    readFile(file, 0, readSize - 1).then(function (start) {
      readFile(file, contentLength - readSize, contentLength).then(function (end) {
        resolve((0, _md2.default)(Buffer.concat([start, end])));
      }).catch(function (error) {
        reject(error);
      });
    }).catch(function (error) {
      reject(error);
    });
  });
};

var availLan = function availLan(file) {
  return new Promise(function (resolve, reject) {
    getHash(_path2.default.resolve(__dirname, file)).then(function (hash) {
      var options = {
        url: 'http://api.thesubdb.com/?action=search&hash=' + hash,
        headers: {
          'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)'
        }
      };
      (0, _requestPromise2.default)(options).then(function (result) {
        resolve(result.split(','));
      }).catch(reject);
    });
  });
};

var downSub = function downSub(lang, file) {
  return new Promise(function (resolve, reject) {
    getHash(_path2.default.resolve(__dirname, file)).then(function (hash) {
      var options = {
        url: 'http://api.thesubdb.com/?action=download&hash=' + hash + '&language=' + lang,
        headers: {
          'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)'
        }
      };
      (0, _requestPromise2.default)(options).then(function (result) {
        _fsExtra2.default.writeFile(_path2.default.resolve(__dirname, _path2.default.dirname(file), _path2.default.basename(file, _path2.default.extname(file)) + '.srt'), result).then(resolve).catch(reject);
      }).catch(reject);
    });
  });
};

module.exports = {
  downSub: downSub,
  availLan: availLan
};