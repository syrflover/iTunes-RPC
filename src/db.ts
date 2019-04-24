import * as fs from 'fs';

import env from './env';
import { parseJSON, stringifyJSON } from './lib/json';
import { pathExists, writeFile, readFile } from './lib/fs';

export interface IHistory {
  assetID: string;
  date: number;
}

export interface IData {
  history: IHistory[];
}

const dbPath = `${env.ASSET_FOLDER}/db.json`;

export const read = async () => {
  const db = (await readFile(dbPath, 'utf8')) as string;

  const res = await parseJSON<IData>(db);

  return res;
};

export const write = async (a: IData) => {
  const stringified = await stringifyJSON(a);

  const res = await writeFile(dbPath, stringified, 'utf8');

  return res;
};

export const initialize = async () => {
  if (!(await pathExists(env.ASSET_FOLDER))) {
    await fs.promises.mkdir(env.ASSET_FOLDER);
  }
  if (!(await pathExists(dbPath))) {
    await write({ history: [] });
  }
};
