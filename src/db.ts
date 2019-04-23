import * as fs from 'fs';

import env from './env';
import { parseJSON, stringifyJSON } from './lib/json';
import { pathExists } from './lib/utils';

export interface IHistory {
  assetID: string;
  date: number;
}

export interface IData {
  history: IHistory[];
}

const dbPath = `${env.ASSET_FOLDER}/db.json`;

export const read = (): Promise<IData> =>
  new Promise((resolve, reject) => {
    let db = '';

    const dbRS = fs.createReadStream(dbPath, { encoding: 'utf8' });

    dbRS.on('data', (data) => {
      db += data;
    });

    dbRS.on('error', (error) => {
      reject(error);
    });

    dbRS.on('end', async () => {
      const parsed = await parseJSON<IData>(db);

      resolve(parsed);

      dbRS.destroy();
    });
  });

export const write = async (a: IData): Promise<boolean> =>
  new Promise(async (resolve, reject) => {
    const stringfied = await stringifyJSON(a);

    const dbWS = fs.createWriteStream(dbPath, { encoding: 'utf8' });

    dbWS.on('error', (error) => {
      reject(error);
    });

    const res = dbWS.write(stringfied);

    resolve(res);
  });

export const initialize = async () => {
  try {
    if (!(await pathExists(env.ASSET_FOLDER))) {
      await fs.promises.mkdir(env.ASSET_FOLDER);
    }
    if (!(await pathExists(dbPath))) {
      await write({ history: [] });
    }
  } catch (e) {
    if (e.code !== 'EEXIST') {
      console.error(e);
      process.exit(1);
    }
  }
};
