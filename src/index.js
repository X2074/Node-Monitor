const { schedule, clearAll } = require('./utils/cronUtil');
const monitorService = require('./services/monitorService');
const cheerioService = require('./services/cheerioService');
const logger = require('./utils/logger');
const config = require('./config');
const cache = require('../src/utils/cacheUtils');

logger.info('Clearing all existing tasks before scheduling new ones.');
clearAll();

schedule('cheerioTask', config.cheerioTaskCron, async () => {
    try {
        const { maxHeight, stateRoot, blockData } = await cheerioService.collectHeights();

        if (maxHeight !== null) {
            cache.set('maxHeight', maxHeight, config.cacheTTL);
            cache.set('stateRoot', stateRoot, config.cacheTTL);
            cache.set('blockData', blockData, config.cacheTTL);
        } else {
            logger.warn('Max height is null, skipping cache update.');
        }
    } catch (error) {
        logger.error(`Error in cheerioTask: ${error.message}`);
    }
});

schedule('monitorTask', config.monitorTaskCron, async () => {
    try {
        const maxHeight = cache.get('maxHeight');
        const stateRoot = cache.get('stateRoot');
        const blockData = cache.get('blockData');
        if (maxHeight && stateRoot && blockData) {
            const chainListNode = {
                maxHeight,
                stateRoot,
                blockData,
            };
            await monitorService.monitor(chainListNode);
        } else {
            logger.warn('Incomplete data in cache for monitorTask. Ensure data is being cached correctly.');
        }
    } catch (error) {
        logger.error(`Error in monitorTask: ${error.message}`);
    }
});

require('./app');
