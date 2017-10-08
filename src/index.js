// @flow
import fs from 'fs';
import path from 'path';
import md5 from 'md5';
import request from 'request';

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

const availLan = (file: string): Promise<Array<string>> =>
  new Promise((resolve, reject) => {
    const hash = getHash(path.resolve(__dirname, file));
    const options = {
      url: `http://api.thesubdb.com/?action=search&hash=${hash}`,
      headers: {
        'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)',
      },
    };
    request(options, (err: Error, res: any, body: any) => {
      if (err) {
        reject(err);
      } else if (res.statusCode === 200) {
        resolve(body.split(','));
      } else {
        reject(new Error(`Received status code: ${res.statusCode}`));
      }
    });
  });

const downSub = (lang: string, file: string): Promise => new Promise((resolve, reject) => {
  const hash = getHash(path.resolve(__dirname, file));
  const options = {
    url: `http://api.thesubdb.com/?action=download&hash=${hash}&language=${lang}`,
    headers: {
      'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)',
    },
  };
  request(options, (err: Error, res: any, body: any) => {
    if (err) {
      reject(err);
    } else if (res.statusCode === 200) {
      fs.writeFile(`${path.basename(file, path.extname(file))}.srt`, body, (err2) => {
        if (err2) { reject(err2); }
        resolve();
      });
    } else {
      reject(new Error(`Received status code: ${res.statusCode}`));
    }
  });
});

module.exports = {
  downSub,
  availLan,
};
