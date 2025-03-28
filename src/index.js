const {schedule, clearAll} = require('./utils/cronUtil');
const nodeHealthMonitorService = require('./services/health/healthMonitorService');
const logger = require('./utils/logger');
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
