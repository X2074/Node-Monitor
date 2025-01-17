const { schedule, clearAll } = require('./utils/cronUtil');
const monitorService = require('./services/monitorService');
const config = require('./config');
const logger = require('./utils/logger');

// 启动时清理所有任务
logger.info('Clearing all existing tasks before scheduling new ones.');
clearAll();

// 调度新任务
schedule('monitorTask', config.cronSchedule, monitorService.monitor);

// 启动 HTTP 服务
require('./app');
