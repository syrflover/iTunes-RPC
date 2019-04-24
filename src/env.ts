import * as dotenv from 'dotenv';

export interface IEnv extends NodeJS.ProcessEnv {
  USER_TOKEN: string;
  APP_CLIENT_ID: string;
  ASSET_FOLDER: string;
}

export default (() => {
  // const isDev = process.env.NODE_ENV === 'development';

  dotenv.config();

  // if (isDev) {
  return {
    ...process.env,
    ASSET_FOLDER: `${process.cwd()}/static`,
  } as IEnv;
  // }
  // return process.env as IEnv;
})();
