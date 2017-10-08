// @flow
import fs from 'fs-extra';
import path from 'path';
import md5 from 'md5';
import request from 'request-promise';

const getHash = (file: string): string => {
  const readSize = 64 * 1024;
  const buffer = fs.readFileSync(file);
  const contentLength = buffer.byteLength;
  const start = Buffer.alloc(readSize);
  const end = Buffer.alloc(readSize);
  buffer.copy(start, 0, 0, readSize);
  buffer.copy(end, 0, contentLength - readSize);
  return md5(Buffer.concat([start, end]));
};

const availLan = (file: string): Promise<Array<string>> => new Promise((resolve, reject) => {
  const hash = getHash(path.resolve(__dirname, file));
  const options = {
    url: `http://api.thesubdb.com/?action=search&hash=${hash}`,
    headers: {
      'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)',
    },
  };
  request(options)
    .then((result: string) => {
      resolve(result.split(','));
    })
    .catch(reject);
});

const downSub = (lang: string, file: string): Promise<string> => new Promise((resolve, reject) => {
  const hash = getHash(path.resolve(__dirname, file));
  const options = {
    url: `http://api.thesubdb.com/?action=download&hash=${hash}&language=${lang}`,
    headers: {
      'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)',
    },
  };
  request(options)
    .then((result: string) => {
      fs.writeFile(path.resolve(__dirname, path.dirname(file), `${path.basename(file, path.extname(file))}.srt`), result)
        .then(resolve)
        .catch(reject);
    })
    .catch(reject);
});

module.exports = {
  downSub,
  availLan,
};
