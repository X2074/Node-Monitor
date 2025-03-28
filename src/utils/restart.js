const {exec} = require('child_process');
const logger = require('./logger');
const path = require('path');
const config = require('../config');
const {sendEmail} = require('../services/mail/mailService');  // Import mail service for notifications

// Get the script directory from the .env configuration
const scriptsDir = config.SCRIPTS_DIR;
const nodeProcessName = config.NODE_PROCESS_NAME;
const startScript = config.START_SCRIPT;
const stopScript = config.STOP_SCRIPT;

/**
 * Execute a shell command asynchronously.
 * @param {string} command - The command to execute.
 * @returns {Promise<string>} - The command output.
 */
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Command failed: ${stderr || stdout}`);
                reject(error);
                return;
            }
            logger.info(`Command succeeded: ${stdout}`);
            resolve(stdout.trim());
        });
    });
}


/**
 * Restart the QNG node with a maximum number of retries.
 * The number of retries is configured via `config.MAX_RESTART_ATTEMPTS`.
 */
async function restartNode() {
    let attempts = 0;
    const maxAttempts = config.MAX_RESTART_ATTEMPTS;

    while (attempts < maxAttempts) {
        try {
            attempts++;
            logger.info(`🔄 Attempting to restart ${nodeProcessName} node... (Try ${attempts}/${maxAttempts})`);
            await stopNode();
            await startNode();
            logger.info('✅ Node restarted successfully.');
            return;
        } catch (error) {
            logger.error(`❌ Restart attempt ${attempts} failed: ${error.message}`);

            if (attempts >= maxAttempts) {
                logger.error('❌ Maximum restart attempts reached. Restart failed.');
                await sendEmail('nodeRestartFailedAlert', {
                    maxAttempts,
                    attempts,
                    errorMessage: error.message,
                });
                throw new Error('Node restart failed after multiple attempts');
            }
            logger.info('Retrying restart...');
        }
    }
}

/**
 * Check if the node process is running.
 * @returns {Promise<boolean>} - True if process is running.
 */
async function isNodeRunning() {
    try {
        const pids = await executeCommand(`pgrep ${nodeProcessName}`);
        return pids.trim().length > 0;
    } catch (error) {
        logger.error(`Error checking if node is running: ${error.message}`);
        return false;
    }
}

/**
 * Start the node.
 * It will check if the process has started successfully.
 */
async function startNode() {
    try {
        logger.info('Attempting to start node...');

        const isRunning = await isNodeRunning();
        if (isRunning) {
            logger.info(`✅ Node is already running.`);
            return;
        }

        await executeCommand(path.join(scriptsDir, startScript));

        let isNodeStarted = false;
        for (let i = 0; i < 30; i++) { // Check up to 30 times, every 2 seconds
            if (await isNodeRunning()) {
                isNodeStarted = true;
                break;
            }
            logger.info('⏳ Waiting for node to start...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!isNodeStarted) {
            logger.error('❌ Node did not start successfully.');
        }
        logger.info('✅ Node started successfully.');
    } catch (error) {
        logger.error(`Failed to start node: ${error.message}`);
        throw new Error('Node start failed');
    }
}

/**
 * Stop the node.
 * The function waits for the shutdown to be fully completed.
 */
async function stopNode() {
    try {
        logger.info('Attempting to stop QNG node...');
        await executeCommand(path.join(scriptsDir, stopScript));

        const logFile = path.join(scriptsDir, `${nodeProcessName}.log`); // Log file path
        let shutdownConfirmed = false;

        for (let i = 0; i < 30; i++) { // Check up to 30 times, every 2 seconds
            const lastLogLine = await executeCommand(`tail -n 1 ${logFile}`);
            if (lastLogLine.includes('Shutdown complete')) {
                shutdownConfirmed = true;
                break;
            }
            logger.info('Waiting for shutdown to complete...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        if (!shutdownConfirmed) logger.error('Shutdown not completed in time.');

        logger.info('✅ Node stopped successfully.');
    } catch (error) {
        logger.error(`Failed to stop node: ${error.message}`);
        throw new Error('Node stop failed');
    }
}


module.exports = {restartNode, startNode, stopNode};
