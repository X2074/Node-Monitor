const {exec} = require('child_process');
const logger = require('../utils/logger');
const path = require('path');
const config = require('../config');
const {sendEmail} = require('./mailService');  // Import mail service for notifications

// Get the script directory from the .env configuration
const scriptsDir = config.SCRIPTS_DIR;

/**
 * Execute a shell command asynchronously.
 * @param {string} command - The command to execute.
 * @returns {Promise<string>} - The command output.
 */
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Command failed: ${stderr}`);
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
            logger.info(`🔄 Attempting to restart QNG node... (Try ${attempts}/${maxAttempts})`);
            await stopNode();
            await startNode();
            logger.info('✅ QNG node restarted successfully.');
            return;
        } catch (error) {
            logger.error(`❌ Restart attempt ${attempts} failed: ${error.message}`);

            if (attempts >= maxAttempts) {
                logger.error('❌ Maximum restart attempts reached. Restart failed.');

                // Send an email notification about the failure
                const subject = "🚨 QNG Node Restart Failed!";
                const message = `The QNG node restart failed after ${maxAttempts} attempts.
                \nError: ${error.message}\n
                Please check the server and restart manually.`;

                await sendEmail(subject, message)
                    .then(() => logger.info("📧 Alert email sent successfully."))
                    .catch(err => logger.error(`❌ Failed to send alert email: ${err.message}`));

                throw new Error('Node restart failed after multiple attempts');
            }
            logger.info('Retrying restart...');
        }
    }
}

/**
 * Start the QNG node.
 * It will check if the process has started successfully.
 */
async function startNode() {
    try {
        logger.info('Attempting to start QNG node...');

        let pids = await executeCommand("pgrep qng").catch(() => '');
        if (pids.trim()) {
            logger.info(`✅ QNG node is already running, PID(s): ${pids}`);
            return;
        }

        await executeCommand(path.join(scriptsDir, 'start.sh'));

        let isRunning = false;
        for (let i = 0; i < 30; i++) { // Check up to 30 times, every 2 seconds
            pids = await executeCommand("pgrep qng").catch(() => '');
            if (pids.trim()) {
                isRunning = true;
                break;
            }
            logger.info('⏳ Waiting for node to start...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!isRunning) throw new Error('❌ QNG node did not start successfully.');

        logger.info(`✅ QNG node started successfully, PID(s): ${pids}`);
    } catch (error) {
        logger.error(`Failed to start QNG node: ${error.message}`);
        throw new Error('Node start failed');
    }
}

/**
 * Stop the QNG node.
 * The function waits for the shutdown to be fully completed.
 */
async function stopNode() {
    try {
        logger.info('Attempting to stop QNG node...');
        await executeCommand(path.join(scriptsDir, 'stop.sh'));

        const logFile = path.join(scriptsDir, 'qng.log'); // Log file path
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
        if (!shutdownConfirmed) throw new Error('Shutdown not completed in time.');

        logger.info('✅ QNG node stopped successfully.');
    } catch (error) {
        logger.error(`Failed to stop QNG node: ${error.message}`);
        throw new Error('Node stop failed');
    }
}

module.exports = {restartNode, startNode, stopNode};
