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

const availLan = (file: string): Promise<string> => new Promise((resolve, reject) => {
  const hash = getHash(path.resolve(__dirname, file));
  const options = {
    url: `http://api.thesubdb.com/?action=search&hash=${hash}`,
    headers: {
      'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)',
    },
  };
  request(options)
    .then((res: any) => {
      if (res.statusCode === 200) {
        resolve(res.body.split(','));
      } else {
        reject(new Error(`Received status code: ${res.statusCode}`));
      }
    })
    .catch((res: any) => { reject(new Error(`Received status code: ${res.statusCode}`)); });
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
    .then((res: any) => {
      if (res.statusCode === 200) {
        fs.writeFile(`${path.basename(file, path.extname(file))}.srt`, res.body)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Received status code: ${res.statusCode}`));
      }
    })
    .catch((res: any) => { reject(new Error(`Received status code: ${res.statusCode}`)); });
});

module.exports = {
  downSub,
  availLan,
};
