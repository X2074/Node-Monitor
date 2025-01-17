const cron = require('node-cron');
const logger = require('./logger');

const tasks = new Map();

/**
 * 创建定时任务
 */
function schedule(name, cronExpression, taskFunction) {
    if (tasks.has(name)) {
        logger.warn(`Task ${name} is already scheduled.`);
        return;
    }
    const task = cron.schedule(cronExpression, taskFunction);
    tasks.set(name, task);
    logger.info(`Task ${name} scheduled.`);
}

/**
 * 停止并删除指定的任务
 */
function stop(name) {
    const task = tasks.get(name);
    if (task) {
        task.stop();
        tasks.delete(name);
        logger.info(`Task ${name} stopped.`);
    } else {
        logger.warn(`Task ${name} not found.`);
    }
}

/**
 * 清除所有任务
 */
function clearAll() {
    tasks.forEach((task, name) => {
        task.stop();
        logger.info(`Task ${name} stopped and removed.`);
    });
    tasks.clear();
    logger.info('All tasks have been cleared.');
}

module.exports = { schedule, stop, clearAll };
