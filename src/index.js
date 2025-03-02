const {schedule, clearAll} = require('./utils/cronUtil');
const monitorService = require('./services/monitorService');
const cheerioService = require('./services/cheerioService');
const logger = require('./utils/logger');
const config = require('./config');
const cache = require('../src/utils/cacheUtils');

logger.info('Clearing all existing tasks before scheduling new ones.');
clearAll();

schedule('cheerioTask', config.cheerioTaskCron, async () => {
    try {
        const {maxHeight, stateRoot, blockData} = await cheerioService.collectHeights();
        if (maxHeight && stateRoot && blockData) {
            const chainListNode = {
                maxHeight,
                stateRoot,
                blockData,
            };
            await monitorService.monitor(chainListNode);
        } else {
            logger.error('Incomplete data in cache for monitorTask. Ensure data is being cached correctly.');
        }
    } catch (error) {
        logger.error(`Error in cheerioTask: ${error.message}`);
    }
});

require('./app');
