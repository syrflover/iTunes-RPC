import { logger } from '../logger';

const imageToBase64 = (data: Buffer | string) => {
    logger.trace('imageToBase64()');
    if (typeof data === 'string') {
        return `data:image/jpeg;base64,${data}`;
    }
    return `data:image/jpeg;base64,${Buffer.from(data).toString('base64')}`;
};

export default imageToBase64;
