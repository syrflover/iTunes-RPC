import * as fs from 'fs';
import {
  deleteRichPresenceAsset,
  getRichPresenceAssets,
} from './src/lib/discord';
import env from './src/env';

const remove = async (p: string, deleteOnlyInDirectory: boolean = false) => {
  const stat = await fs.promises.stat(p);

  if (stat.isFile()) {
    await fs.promises.unlink(p);
  } else if (stat.isDirectory()) {
    const readDir = await fs.promises.readdir(p);

    if (readDir.length > 0) {
      for (const s of readDir) {
        await remove(`${p}/${s}`);
      }
    }
    if (!deleteOnlyInDirectory) {
      await fs.promises.rmdir(p);
    }
  }
};

remove(env.ASSET_FOLDER, true).then(() => {
  console.log('success remove all files and directory');
});

getRichPresenceAssets().then((assets) => {
  const a = assets.map(({ name }) => name);

  deleteRichPresenceAsset(assets, a).then(() => {
    console.log('success delete all asset');
    // process.exit(0);
  });
});
