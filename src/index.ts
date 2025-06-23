console.log("🟢 CURRENT BUILD: ", new Date().toISOString());
import {CronManager} from './utils/system/cronUtil';
import nodeHealthMonitorService from './services/health/healthMonitorService';
import {generateAndSendWeeklyReport} from './services/report/weeklyReportService';
import logger from './utils/core/logger';
import config from './config';
import './app';

logger.info('Clearing all existing tasks before scheduling new ones.');
CronManager.clearAll();

CronManager.schedule('nodeMonitorTask', config.monitorTaskCron, async () => {
    try {
        logger.info('Starting node monitoring task...');
        await nodeHealthMonitorService.monitor();
    } catch (error: any) {
        logger.error(`Error in monitorTask: ${error.message}`);
    }
});


CronManager.schedule('weeklyReportTask', config.weeklyReportCron, async () => {
    try {
        logger.info('Starting to generate and send the weekly report...');
        await generateAndSendWeeklyReport();
        logger.info('Weekly report generated and sent successfully.');
    } catch (error: any) {
        logger.error(`Error in weekly report task: ${error.message}`);
    }
});
