import * as F from 'nodekell';
import * as RPC from 'discord-rpc';

import { IEnv } from './env';
import { logger } from './logger';

export const checkEnv = async (ienv: IEnv) => {
    logger.trace('checkEnv()');
    const a = await F.run(
        [ienv.APP_CLIENT_ID, ienv.USER_TOKEN],
        F.every((e) => (typeof e === 'string' ? e.trim().length > 0 : false)),
    );

    return a;
};

export const checkRPC = (rpc: RPC.Client | null) => {
    logger.trace('checkRPC()');
    if (!rpc) {
        logger.debug('\ncheckRPC() =', false, '!rpc');
        return false;
    }

    if (!rpc.transport.socket) {
        logger.debug('\ncheckRPC() =', false, 'Discord is not opened');
        // discord is not opened
        return false;
    }

    if (rpc.transport.socket) {
        const r = !rpc.transport.socket.destroyed;
        logger.debug('\nCheckRPC() =', r, '!rpc.transport.socket.destroyed');
        return r;
    }

    logger.debug('\nCheckRPC() =', true);
    return true;
};
