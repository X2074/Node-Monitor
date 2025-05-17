import {exec} from 'child_process';
import path from 'path';
import {promisify} from 'util';
import logger from '../core/logger';
import config from '../../config';
import {sendAndRecordEmail} from '../../services/mail/senders';

const execAsync = promisify(exec);

const scriptsDir: string = config.SCRIPTS_DIR ?? '';
if (!scriptsDir) throw new Error('Missing script directory config.');


const nodeProcessName: string = config.NODE_PROCESS_NAME;
const startScript: string = config.START_SCRIPT;
const stopScript: string = config.STOP_SCRIPT;
const maxRestartAttempts: number = config.MAX_RESTART_ATTEMPTS;
const maxWaitAttempts: number = config.MAX_WAIT_ATTEMPTS;

/**
 * Execute a shell command asynchronously.
 */

async function executeCommand(command: string): Promise<string> {
    try {
        const {stdout, stderr} = await execAsync(command);
        if (stderr) logger.warn(`⚠️ stderr: ${stderr}`);
        logger.info(`✅ Command output: ${stdout?.trim()}`);
        return stdout?.trim() ?? '';
    } catch (error) {
        logger.error(`❌ Command failed: ${(error as Error).message}`);
        throw error;
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function isNodeRunning(): Promise<boolean> {
    try {
        const output = await executeCommand(`pgrep ${nodeProcessName}`);
        return output.trim().length > 0;
    } catch (error) {
        logger.error(`Error checking node status: ${(error as Error).message}`);
        return false;
    }
}

export async function startNode(): Promise<void> {
    logger.info('Attempting to start node...');
    if (await isNodeRunning()) {
        logger.info('✅ Node already running.');
        return;
    }

    await executeCommand(path.join(scriptsDir, startScript));

    for (let i = 0; i < maxWaitAttempts; i++) {
        if (await isNodeRunning()) {
            logger.info('✅ Node started successfully.');
            return;
        }
        logger.info(`⏳ Waiting for node to start... (${i + 1}/${maxWaitAttempts})`);
        await sleep(2000);
    }

    throw new Error('Node did not start within the expected time.');
}

export async function stopNode(): Promise<void> {
    logger.info('Attempting to stop node...');
    await executeCommand(path.join(scriptsDir, stopScript));

    for (let i = 0; i < maxWaitAttempts; i++) {
        if (!(await isNodeRunning())) {
            logger.info('✅ Node stopped successfully.');
            return;
        }
        logger.info(`⏳ Waiting for node to stop... (${i + 1}/${maxWaitAttempts})`);
        await sleep(2000);
    }

    throw new Error('Node did not stop within the expected time.');
}


export async function restartNode() {
    let attempts = 0;
    while (attempts < maxRestartAttempts) {
        try {
            attempts++;
            logger.info(`🔄 Attempting to restart ${nodeProcessName} node... (Try ${attempts}/${maxRestartAttempts})`);
            await stopNode();
            await startNode();
            logger.info('✅ Node restarted successfully.');
            return;
        } catch (error) {
            const err = error as Error;
            logger.error(`❌ Restart attempt ${attempts} failed: ${err.message}`);
            if (attempts >= maxRestartAttempts) {
                logger.error('❌ Maximum restart attempts reached. Restart failed.');
                await sendAndRecordEmail('nodeRestartFailedAlert', {
                    maxRestartAttempts,
                    attempts,
                    errorMessage: err.message,
                });
                throw new Error('Node restart failed after multiple attempts');
            }
            logger.info('Retrying restart...');
        }
    }
}

export async function isShutdownComplete(): Promise<boolean> {
    try {
        const logFile = path.join(scriptsDir, `${nodeProcessName}.log`);
        const lastLine = await executeCommand(`tail -n 1 ${logFile}`);
        return lastLine.includes('Shutdown complete');
    } catch (error) {
        logger.error(`Failed to check shutdown status: ${(error as Error).message}`);
        return false;
    }
}

