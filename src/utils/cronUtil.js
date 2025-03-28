const cron = require('node-cron');
const logger = require('./logger');

const tasks = new Map();


function schedule(name, cronExpression, taskFunction, options = {start: true}) {
    if (tasks.has(name)) {
        logger.warn(`Task ${name} is already scheduled.`);
        return;
    }
    const task = cron.schedule(cronExpression, taskFunction, {
        scheduled: options.start,
    });
    tasks.set(name, task);
    logger.info(`Task ${name} scheduled${options.start ? '' : ' (not started)'}.`);
}

function list() {
    const status = [];
    tasks.forEach((task, name) => {
        status.push({
            name,
            running: task.running,
        });
    });
    return status;
}

function printList() {
    logger.info('Scheduled tasks:');
    tasks.forEach((task, name) => {
        logger.info(`- ${name} : ${task.running ? 'running' : 'stopped'}`);
    });
}

function pause(name) {
    const task = tasks.get(name);
    if (task) {
        task.stop();
        logger.info(`Task ${name} paused.`);
    } else {
        logger.warn(`Task ${name} not found.`);
    }
}

function remove(name) {
    const task = tasks.get(name);
    if (task) {
        task.stop();
        tasks.delete(name);
        logger.info(`Task ${name} removed.`);
    } else {
        logger.warn(`Task ${name} not found.`);
    }
}

function start(name) {
    const task = tasks.get(name);
    if (task) {
        task.start();
        logger.info(`Task ${name} started.`);
    } else {
        logger.warn(`Task ${name} not found.`);
    }
}

function clearAll() {
    tasks.forEach((task, name) => {
        task.stop();
        logger.info(`Task ${name} stopped and removed.`);
    });
    tasks.clear();
    logger.info('All tasks have been cleared.');
}

module.exports = {schedule, start, pause, remove, clearAll, list, printList};
