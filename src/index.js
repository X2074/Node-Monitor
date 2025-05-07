const {schedule, clearAll} = require('./utils/system/cronUtil');
const nodeHealthMonitorService = require('./services/health/healthMonitorService');
const logger = require('./utils/core/logger');
const config = require('./config');

logger.info('Clearing all existing tasks before scheduling new ones.');
clearAll();

schedule('nodeMonitorTask', config.monitorTaskCron, async () => {
    try {
        logger.info('Starting node monitoring task...');
        await nodeHealthMonitorService.monitor();
    } catch (error) {
        logger.error(`Error in monitorTask: ${error.message}`);
    }
});

require('./app');
