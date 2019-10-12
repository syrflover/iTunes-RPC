import client from 'axios';
import * as F from 'nodekell';
import env from '../env';
import { logger } from '../logger';

const clientID = env.APP_CLIENT_ID;
const userToken = env.USER_TOKEN;

const axios = client.create({
    baseURL: 'https://discordapp.com',
});

export const deleteRichPresenceAsset = async (
    assets: IRichPresenceAsset[],
    assetsNames: string[],
) => {
    logger.trace('deleteRichPresenceAsset()');
    await F.forEach(async (asset) => {
        if (assetsNames.includes(asset.name)) {
            logger.debug('\nasset =', asset);
            try {
                const headers = {
                    authorization: userToken,
                };
                await axios.delete(
                    `/api/oauth2/applications/${clientID}/assets/${asset.id}`,
                    { headers },
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
    logger.trace('getRichPresenceAssets()');
    return new Promise(async (resolve, reject) => {
        const headers = {
            authorization: userToken,
        };
        await axios
            .get(`/api/oauth2/applications/${clientID}/assets`, { headers })
            .then((res) => {
                // logger.debug('\ngetRichPresenceAssets =', res.data);
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
    logger.trace('uploadRichPresenceAsset()');
    return new Promise(async (resolve, reject) => {
        const headers = {
            authorization: userToken,
        };
        await axios
            .post(`/api/oauth2/applications/${clientID}/assets`, data, {
                headers,
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
    logger.trace('checkAssetsLimit()');
    const isLimit = assets.length >= limit;

    logger.debug('\ncheckAssetsLimit() =', isLimit);
    return isLimit;
};
