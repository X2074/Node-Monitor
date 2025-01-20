const {schedule, clearAll} = require('./utils/cronUtil');
const monitorService = require('./services/monitorService');
const cheerioService = require('./services/cheerioService');
const logger = require('./utils/logger');

const cache = require('../src/utils/cacheUtils');

logger.info('Clearing all existing tasks before scheduling new ones.');
clearAll();


schedule('cheerioTask', "*/1 * * * *", async () => {
    try {
        const {maxHeight, stateRoot, blockData} = await cheerioService.collectHeights();

        if (maxHeight !== null) {
            cache.set('maxHeight', maxHeight, 120);
            cache.set('stateRoot', stateRoot, 120);
            cache.set('blockData', blockData, 120);
        } else {
            logger.warn('Max height is null, skipping cache update.');
        }
    } catch (error) {
        logger.error(`Error in cheerioTask: ${error.message}`);
    }
});

schedule('monitorTask', "*/2 * * * *", async () => {
    try {
        const maxHeight = cache.get('maxHeight');
        const stateRoot = cache.get('stateRoot');
        const blockData = cache.get('blockData');

        if (maxHeight && stateRoot && blockData) {
            // 组合数据
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
