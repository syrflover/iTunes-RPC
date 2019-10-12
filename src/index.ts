import './types/Array';

import * as fs from 'fs';
import * as RPC from 'discord-rpc';
import * as uuid from 'uuid/v5';
import * as F from 'nodekell';
import { DateTime } from 'luxon';
import { pathExists, readFile } from '@syrflover/simple-store';
import urlSlug = require('url-slug');
import { logger } from './logger';

import {
    getCurrentPlayingInfo,
    saveArtWorkOfCurrentTrack,
    isStopped,
} from './lib/itunes';
import {
    getRichPresenceAssets,
    uploadRichPresenceAsset,
    deleteRichPresenceAsset,
    checkAssetsLimit,
} from './lib/discord';
import imageToBase64 from './lib/imageToBase64';
import { store } from './store';
import env from './env';
import { uniq, random } from './lib/utils';
import { checkEnv, checkRPC } from './checker';

type Artist = string;
type Album = string;
type Title = string;

const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

const prev: [Artist, Album, Title] = ['', '', ''];
let assetKey = 'init';

const setRPC = async (drpc: RPC.Client | null) => {
    // stopped !== paused
    if (!checkRPC(drpc) || (await isStopped())) {
        return;
    }

    const playInfo = await getCurrentPlayingInfo();

    const { title, album, artist, time } = playInfo;

    const { duration, position } = time;

    const current = [artist, album, title];
    const isChange = await F.some((e) => !current.includes(e), prev);

    if (isChange) {
        // logger.log('');

        prev.clear().push(artist, album, title);

        const songKey = urlSlug(`${artist} ${album} ${title}`);

        const assets = await getRichPresenceAssets();

        const {
            exists: hasCoverInITunes,
            path: imagePath,
        } = await saveArtWorkOfCurrentTrack(songKey);

        // prettier-ignore
        logger.trace(`${hasCoverInITunes ? 'Has' : `Hasn't`} Album Art in iTunes`, songKey);

        if (!hasCoverInITunes) {
            assetKey = 'has_not_album_art';
            return;
        }

        const cover = imageToBase64(await readFile(imagePath, 'base64'));

        const id = uuid(cover, UUID_NAMESPACE).replace(/\-/g, '');

        logger.trace('Read History Data');
        const { history: historyDB } = await store.read();

        if (checkAssetsLimit(assets, 150)) {
            const removeTarget = random(assets);

            if (removeTarget.name !== id) {
                const removed = await F.run(
                    historyDB,
                    F.filter((e) => e.assetID !== removeTarget.name),
                    F.collect,
                );

                logger.trace('Remove History', id);
                await store.write({
                    history: removed,
                });

                await deleteRichPresenceAsset(assets, [removeTarget.name]);
                // logger.trace('Delete Rich Presence Asset', removeTarget.name);

                const updateAssets = await F.run(
                    assets,
                    F.filter((e) => e.name !== removeTarget.name),
                    F.collect,
                );

                assets.clear().push(...updateAssets);
            }
        }

        const alreadyCoverInLocal = await pathExists(
            `${env.ASSET_FOLDER}/${id}.jpg`,
        );

        // rename or remove image file

        if (!alreadyCoverInLocal && hasCoverInITunes) {
            logger.trace(`Not Ready Album Art in Local`);
            fs.promises
                .rename(imagePath, `${env.ASSET_FOLDER}/${id}.jpg`)
                .then(() =>
                    logger.debug(
                        `\nRename`,
                        imagePath,
                        `${env.ASSET_FOLDER}/${id}.jpg`,
                    ),
                );
        } else if (alreadyCoverInLocal) {
            logger.trace('Already Album Art in Local');
            fs.promises
                .unlink(imagePath)
                .then(() => logger.debug(`\nRemove`, imagePath));
        }

        // upload asset

        const songInAsset = await F.some((e) => e.name === id, assets);

        if (!songInAsset) {
            await uploadRichPresenceAsset({
                name: id,
                image: cover,
                type: 1,
            });
            // logger.info(`Upload Rich Presence Asset <- ${id}`);
        }

        // update history

        const updatedHistory = await uniq((e) => e.assetID, [
            { assetID: id, date: Date.now() },
            ...historyDB,
        ]);

        logger.trace('Update Song History', id);
        await store.write({
            history: updatedHistory,
        });

        assetKey = id;
    } else {
        const startTimestamp = DateTime.local().toSeconds();
        const endTimestamp = DateTime.fromSeconds(startTimestamp)
            .plus({
                seconds: duration - position,
            })
            .toSeconds();

        drpc!
            .setActivity({
                details: title,
                state: artist,
                startTimestamp: Math.round(startTimestamp),
                endTimestamp: Math.round(endTimestamp),
                largeImageKey: assetKey,
                largeImageText: album,
                // smallImageKey: state,
                // smallImageText: state,
                instance: true,
            })
            .catch((e) => logger.error(e));
    }
    return;
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

RPC.register(env.APP_CLIENT_ID);

let rpc: RPC.Client | null = new RPC.Client({ transport: 'ipc' });

rpc.login({
    clientId: env.APP_CLIENT_ID,
}).catch((error) => {
    if (error.message !== 'Could not connect') {
        logger.error(error);
    }
});

rpc.once('ready', async () => {
    logger.info('\nready', 'pid =', process.pid);
});

setInterval(() => {
    if (checkRPC(rpc)) {
        return;
    }
    rpc = new RPC.Client({ transport: 'ipc' });

    rpc.once('ready', async () => {
        logger.info('\nready', 'pid =', process.pid);
    });

    rpc.login({
        clientId: env.APP_CLIENT_ID,
    }).catch((error) => {
        if (error.message !== 'Could not connect') {
            logger.error(error);
        }
        rpc = null;
    });
    return;
}, 12e3);

store
    .initialize({ history: [] })
    .then(async () => {
        if (!(await checkEnv(env))) {
            logger.error('Please Set Client ID and User Token');
            process.exit(1);
        }

        F.interval(1000, () => {
            setRPC(rpc).catch((e) => logger.error(e));
        });
    })
    .catch((e) => {
        logger.error(e);
        process.exit(1);
    });
