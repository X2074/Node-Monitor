import cron, {ScheduledTask} from 'node-cron';
import logger from '../core/logger';

// Stores all scheduled tasks by name
const tasks: Map<string, ScheduledTask> = new Map();

interface ScheduleOptions {
    start?: boolean; // whether to start the task immediately (default: true)
}

/**
 * Schedule a new cron task.
 * Prevents duplication by task name.
 */
function schedule(
    name: string,
    cronExpression: string,
    taskFunction: () => void,
    options: ScheduleOptions = {start: true}
): void {
    if (tasks.has(name)) {
        logger.warn(`Task ${name} is already scheduled.`);
        return;
    }

    const task = cron.schedule(cronExpression, taskFunction, {
        scheduled: options.start ?? true,
    });

    tasks.set(name, task);
    logger.info(`Task ${name} scheduled${options.start ? '' : ' (not started)'}.`);
}

function isTaskRunning(task: ScheduledTask): boolean {
    return (task as any).running ?? false;
}

/**
 * Returns a list of all tasks and their running status.
 */
function list(): { name: string; running: boolean }[] {
    const status: { name: string; running: boolean }[] = [];

    tasks.forEach((task, name) => {
        status.push({name, running: isTaskRunning(task)});
    });

    return status;
}


/**
 * Pauses a specific task by name (if it exists).
 */
function pause(name: string): void {
    const task = tasks.get(name);
    if (task) {
        task.stop();
        logger.info(`Task ${name} paused.`);
    } else {
        logger.warn(`Task ${name} not found.`);
    }
}

/**
 * Removes a task completely (and stops it if running).
 */
function remove(name: string): void {
    const task = tasks.get(name);
    if (task) {
        task.stop();
        tasks.delete(name);
        logger.info(`Task ${name} removed.`);
    } else {
        logger.warn(`Task ${name} not found.`);
    }
}

/**
 * Starts a task by name (if it exists).
 */
function start(name: string): void {
    const task = tasks.get(name);
    if (task) {
        task.start();
        logger.info(`Task ${name} started.`);
    } else {
        logger.warn(`Task ${name} not found.`);
    }
}

/**
 * Stops and clears all scheduled tasks.
 */
function clearAll(): void {
    tasks.forEach((task, name) => {
        task.stop();
        logger.info(`Task ${name} stopped and removed.`);
    });
    tasks.clear();
    logger.info('All tasks have been cleared.');
}

export const CronManager = {
    schedule,
    list,
    pause,
    start,
    clearAll,
};
