import * as fs from 'fs';
import { exists } from 'fs';

export const pathExists = (p: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    exists(p, (ex) => {
      resolve(ex);
    });
  });

export const readFile = (p: string, encoding: string): Promise<string> =>
  new Promise((resolve, reject) => {
    let res = '';

    const rs = fs.createReadStream(p, encoding);

    rs.on('data', (data) => {
      res += data;
    });

    rs.once('error', (error) => {
      reject(error);
      rs.destroy();
    });

    rs.once('end', async () => {
      resolve(res);
      rs.destroy();
    });
  });

export const writeFile = (
  p: string,
  data: any,
  encoding: string,
): Promise<boolean> =>
  new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(p, { encoding });

    ws.once('error', (error) => {
      reject(error);
      ws.destroy();
    });

    const res = ws.write(data);

    resolve(res);

    setImmediate(() => {
      ws.destroy();
    });
  });
