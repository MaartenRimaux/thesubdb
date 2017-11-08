// @flow
import fs from 'fs-extra';
import path from 'path';
import md5 from 'md5';
import request from 'request-promise';

const readFile = (file: string, start: number, end: number): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    let data;
    const readStream = fs.createReadStream(file, { start, end });
    readStream
      .on('data', (chunk: Buffer) => {
        if (!data) {
          data = chunk;
        } else {
          data = Buffer.concat([data, chunk]);
        }
      })
      .on('end', (): Buffer => resolve(data))
      .on('error', (error: Error) => {
        reject(error);
      });
  });

const getHash = (file: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const readSize = 64 * 1024;
    const contentLength = fs.statSync(file).size;
    readFile(file, 0, readSize - 1)
      .then((start: Buffer) => {
        readFile(file, contentLength - readSize, contentLength)
          .then((end: Buffer) => {
            resolve(md5(Buffer.concat([start, end])));
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });

const availLan = (file: string): Promise<Array<string>> =>
  new Promise((resolve, reject) => {
    getHash(path.resolve(__dirname, file)).then((hash: string) => {
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
  });

const downSub = (lang: string, file: string): Promise<string> =>
  new Promise((resolve, reject) => {
    getHash(path.resolve(__dirname, file)).then((hash: string) => {
      const options = {
        url: `http://api.thesubdb.com/?action=download&hash=${hash}&language=${lang}`,
        headers: {
          'User-Agent': 'SubDB/1.0 (thesubdb/0.1; https://github.com/MaartenRimaux/thesubdb)',
        },
      };
      request(options)
        .then((result: string) => {
          fs
            .writeFile(
              path.resolve(
                __dirname,
                path.dirname(file),
                `${path.basename(file, path.extname(file))}.srt`,
              ),
              result,
            )
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  });

module.exports = {
  downSub,
  availLan,
};
