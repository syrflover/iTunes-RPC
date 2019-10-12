import { getLogger } from 'log4js';
import env from './env';

export const logger = getLogger('iTunesRPC');
logger.level = env.LOG_LEVEL || 'info';
