'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getHash = function getHash(file) {
  var readSize = 64 * 1024;
  var buffer = _fs2.default.readFileSync(file);
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
    (0, _request2.default)(options, function (err, res, body) {
      if (err) {
        reject(err);
      } else if (res.statusCode === 200) {
        resolve(body.split(','));
      } else {
        reject(new Error('Received status code: ' + res.statusCode));
      }
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
    (0, _request2.default)(options, function (err, res, body) {
      if (err) {
        reject(err);
      } else if (res.statusCode === 200) {
        _fs2.default.writeFile(_path2.default.basename(file, _path2.default.extname(file)) + '.srt', body, function (err2) {
          if (err2) {
            reject(err2);
          }
          resolve();
        });
      } else {
        reject(new Error('Received status code: ' + res.statusCode));
      }
    });
  });
};

module.exports = {
  downSub: downSub,
  availLan: availLan
};