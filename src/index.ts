import './types/Array';

import * as fs from 'fs';
import * as RPC from 'discord-rpc';
import * as moment from 'moment';
import * as uuid from 'uuid/v5';
import * as F from 'nodekell';
import urlSlug = require('url-slug');

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
import * as db from './db';
import env, { IEnv } from './env';
import { find, uniq } from './lib/utils';
import { pathExists, readFile } from './lib/fs';
import { checkEnv, checkRPC } from './checker';

type Artist = string;
type Album = string;
type Title = string;

const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

const prev: [Artist, Album, Title] = ['', '', ''];
let assetKey = 'init';

const setRPC = async () => {
  // stopped !== paused
  if (!checkRPC(rpc) || (await isStopped())) {
    return;
  }

  const playInfo = await getCurrentPlayingInfo();

  const { title, album, artist, time } = playInfo;

  const { duration, position } = time;

  const current = [artist, album, title];
  const isChange = await F.some((e) => !current.includes(e), prev);

  if (isChange) {
    console.log('\n\n');

    prev.clear().push(artist, album, title);

    const songKey = urlSlug(`${artist} ${album} ${title}`);

    const assets = await getRichPresenceAssets();
    console.info('Get Rich Presence Assets');

    const {
      exists: hasCoverInITunes,
      path: imagePath,
    } = await saveArtWorkOfCurrentTrack(songKey);
    console.info(`Save Album Art <- ${songKey}`);

    console.info(
      `${
        hasCoverInITunes ? 'Has' : `Has'nt`
      } Album Art in iTunes <- ${songKey}`,
    );

    if (!hasCoverInITunes) {
      assetKey = 'has_not_album_art';
      return;
    }

    const cover = imageToBase64(await readFile(imagePath, 'base64'));
    console.info(`Album Art Encode to base64 <- ${songKey}`);

    const id = uuid(cover, UUID_NAMESPACE).replace(/\-/g, '');

    const { history: historyDB } = await db.read();

    if (checkAssetsLimit(assets, 150)) {
      const removeTarget = await F.run(historyDB, F.minBy((e) => e.date));

      if (removeTarget.assetID !== id) {
        const removed = await F.run(
          historyDB,
          F.filter((e) => e.date !== removeTarget.date),
          F.collect,
        );

        await db.write({
          history: removed,
        });
        console.info(`Remove History <- ${id}`);

        await deleteRichPresenceAsset(assets, [removeTarget.assetID]);
        console.info(`Delete Rich Presence Asset <- ${removeTarget.assetID}`);

        const updateAssets = await F.run(
          assets,
          F.filter((e) => e.name !== removeTarget.assetID),
          F.collect,
        );

        assets.clear().push(...updateAssets);
      }
    }

    // rename or remove image file

    const alreadyCoverInLocal = await pathExists(
      `${env.ASSET_FOLDER}/${id}.jpg`,
    );

    if (!alreadyCoverInLocal && hasCoverInITunes) {
      console.info(`Not Ready Album Art in Local`);
      await fs.promises.rename(imagePath, `${env.ASSET_FOLDER}/${id}.jpg`);
      console.info(`Rename <- ${songKey}.jpg to ${id}.jpg`);
    } else if (alreadyCoverInLocal) {
      console.info('Arleady Album Art in Local');
      await fs.promises.unlink(imagePath);
      console.info(`Remove <- ${songKey}.jpg`);
    }

    // upload and db write

    const songInAsset = await F.run(assets, find((e) => e.name === id));

    if (!songInAsset) {
      try {
        await uploadRichPresenceAsset({
          name: id,
          image: cover,
          type: 1,
        });
        console.info(`Upload Rich Presence Asset <- ${id}`);
      } catch (e) {
        console.error(e);
      }
    }

    // update song and history

    const updatedHistory = await uniq((e) => e.assetID, [
      { assetID: id, date: Date.now() },
      ...historyDB,
    ]);

    await db.write({
      history: updatedHistory,
    });
    console.info(`Update Song and History <- ${id}`);

    assetKey = id;
  } else {
    const startTimestamp = moment().unix();
    const endTimestamp = moment()
      .add(Math.round(duration - position), 'seconds')
      .unix();

    rpc!
      .setActivity({
        details: `${title}`,
        state: artist,
        startTimestamp,
        endTimestamp,
        largeImageKey: assetKey,
        largeImageText: album,
        // smallImageKey: state,
        // smallImageText: state,
        instance: true,
      })
      .catch(console.error);
  }
  return;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

RPC.register(env.APP_CLIENT_ID);

let rpc: RPC.Client | null = new RPC.Client({ transport: 'ipc' });

rpc
  .login({
    clientId: env.APP_CLIENT_ID,
  })
  .catch((error) => {
    if (error.message !== 'Could not connect') {
      console.error(error);
    }
  });

rpc.on('ready', async () => {
  console.log('ready', 'pid =', process.pid);
});

setInterval(async () => {
  if (checkRPC(rpc)) {
    return;
  }
  rpc = new RPC.Client({ transport: 'ipc' });

  rpc.on('ready', async () => {
    console.log('ready', 'pid =', process.pid);
  });

  rpc
    .login({
      clientId: env.APP_CLIENT_ID,
    })
    .catch((error) => {
      if (error.message !== 'Could not connect') {
        console.error(error);
      }
      rpc = null;
    });
  return;
}, 12e3);

db.initialize().then(async () => {
  if (!(await checkEnv(env))) {
    console.error('Please Set Client ID and User Token');
    process.exit(1);
  }

  const timer = F.interval(1000, setRPC);
});
