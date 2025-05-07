const {exec} = require('child_process');
const logger = require('../core/logger');
const path = require('path');
const config = require('../../config');
const { sendAndRecordEmail } = require('../../services/mail/senders'); // Updated to use sendAndRecordEmail

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
                await sendAndRecordEmail('nodeRestartFailedAlert', {
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
 * Check if the log file contains "Shutdown complete".
 * Currently unused, reserved for future use.
 * @returns {Promise<boolean>}
 */
async function isShutdownComplete() {
    try {
        const logFile = path.join(scriptsDir, `${nodeProcessName}.log`);
        const lastLogLine = await executeCommand(`tail -n 1 ${logFile}`);
        return lastLogLine.includes('Shutdown complete');
    } catch (err) {
        logger.error(`Failed to read log file: ${err.message}`);
        return false;
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
        for (let i = 0; i < config.MAX_WAIT_ATTEMPTS; i++) {
            if (await isNodeRunning()) {
                logger.info('✅ Node started successfully.');
                return;
            }
            logger.info(`⏳ Waiting for node to start... (${i + 1}/${config.MAX_WAIT_ATTEMPTS})`);
            await sleep(2000);
        }
        const msg = 'Node did not start successfully within the expected time.';
        throw new Error(msg);
    } catch (error) {
        logger.error(`Failed to start node: ${error.message}`);
        throw error;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Stop the node.
 * The function waits for the shutdown to be fully completed.
 */
async function stopNode() {
    try {
        logger.info('Attempting to stop QNG node...');
        await executeCommand(path.join(scriptsDir, stopScript));
        let stillRunning = true;
        for (let i = 0; i < config.MAX_WAIT_ATTEMPTS; i++) {
            stillRunning = await isNodeRunning();
            if (!stillRunning) break;
            logger.info(`⏳ Waiting for node to stop... (${i + 1}/${config.MAX_WAIT_ATTEMPTS})`);
            await sleep(2000);
        }
        if (stillRunning) {
            logger.error('❌ Node stop timeout.');
            throw new Error('Node did not stop within the expected time.');
        }
        logger.info('✅ Node stopped successfully.');
    } catch (error) {
        logger.error(`Failed to stop node: ${error.message}`);
        throw error;
    }
}

module.exports = {restartNode, startNode, stopNode, isShutdownComplete};
