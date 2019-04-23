import {
  deleteRichPresenceAsset,
  getRichPresenceAssets,
} from './src/lib/discord';
import env from './src/env';

import remove from './src/lib/remove';

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
