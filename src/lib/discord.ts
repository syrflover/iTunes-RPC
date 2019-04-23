import client from 'axios';
import * as F from 'nodekell';
import env from '../env';

const clientID = env.APP_CLIENT_ID;
const userToken = env.USER_TOKEN;

const axios = client.create({
  baseURL: 'https://discordapp.com',
});

export const deleteRichPresenceAsset = async (
  assets: IRichPresenceAsset[],
  assetsNames: string[],
) => {
  await F.forEach(async (asset) => {
    if (assetsNames.includes(asset.name)) {
      try {
        await axios.delete(
          `/api/oauth2/applications/${clientID}/assets/${asset.id}`,
          {
            headers: {
              authorization: userToken,
            },
          },
        );
      } catch (e) {
        throw e;
      }
    }
  }, assets);
};

export interface IRichPresenceAsset {
  type: string;
  name: string;
  id: string;
}

export const getRichPresenceAssets = async (): Promise<
  IRichPresenceAsset[]
> => {
  return new Promise(async (resolve, reject) => {
    await axios
      .get(`/api/oauth2/applications/${clientID}/assets`, {
        headers: {
          authorization: userToken,
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
};

export interface IAssetUploadData {
  name: string;
  image: string;
  type: number;
}

export const uploadRichPresenceAsset = (
  data: IAssetUploadData,
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    await axios
      .post(`/api/oauth2/applications/${clientID}/assets`, data, {
        headers: {
          authorization: userToken,
        },
      })
      .then(() => {
        resolve();
      })
      .catch(reject);
  });
};

export const checkAssetsLimit = (
  assets: IRichPresenceAsset[],
  limit: number,
) => {
  const isLimit = assets.length >= limit;

  return isLimit;
};
