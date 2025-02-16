const { exec } = require('child_process');
const logger = require('../utils/logger');
const path = require('path');
const config = require('../config');
// 从 .env 文件中获取脚本目录
const scriptsDir = config.SCRIPTS_DIR;
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(`sudo -u ubuntu ${command}`, (error, stdout, stderr) => {
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


async function restartNode() {
    try {
        logger.info('Attempting to restart Qitmeer node...');
        await executeCommand(path.join(scriptsDir, 'stop.sh')); 
        await executeCommand(path.join(scriptsDir, 'start.sh')); 
        logger.info('Qitmeer node restarted successfully.');
    } catch (error) {
        logger.error(`Failed to restart Qitmeer node: ${error.message}`);
        throw new Error('Node restart failed');
    }
}

async function startNode() {
    try {
        logger.info('Attempting to start Qitmeer node...');
        await executeCommand(path.join(scriptsDir, 'start.sh'));
        logger.info('Qitmeer node started successfully.');
    } catch (error) {
        logger.error(`Failed to start Qitmeer node: ${error.message}`);
        throw new Error('Node start failed');
    }
}

async function stopNode() {
    try {
        logger.info('Attempting to stop Qitmeer node...');
        await executeCommand(path.join(scriptsDir, 'stop.sh'));
        logger.info('Qitmeer node stopped successfully.');
    } catch (error) {
        logger.error(`Failed to stop Qitmeer node: ${error.message}`);
        throw new Error('Node stop failed');
    }
}

module.exports = { restartNode, startNode, stopNode };