import * as F from 'nodekell';
import * as RPC from 'discord-rpc';

import { IEnv } from './env';

export const checkEnv = async (ienv: IEnv) => {
  const a = await F.run(
    [ienv.APP_CLIENT_ID, ienv.USER_TOKEN],
    F.every((e) => e.trim().length > 0),
  );

  return a;
};

export const checkRPC = (r: RPC.Client | null) => {
  if (!r) {
    return false;
  }

  if (!r.transport.socket) {
    // discord is not opened
    return false;
  }

  if (r.transport.socket) {
    return !r.transport.socket.destroyed;
  }

  return true;
};
