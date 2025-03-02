const logger = require('../utils/logger');
const {compareNodeStatus} = require('./nodeService');
const {restartNode} = require('./restartService');
const {sendEmail} = require('./mailService');
const config = require("../config");

/**
 * Monitors the node status to ensure its stability.
 */
async function monitor(chainListNode) {
    try {
        // Call compareNodeStatus to get the node status
        const {isStable, isStateRootMatching, localNode, reason} = await compareNodeStatus(chainListNode);

        // **If the node is unstable**
        if (!isStable) {
            // **If the node is resyncing, skip further checks**
            if (reason === "Resyncing") {
                logger.info(`⏳ Node is resyncing: ${reason}. Local height: ${localNode.evmHeight}, Chain height: ${chainListNode.maxHeight}. Skipping further checks.`);
                return;
            }

            // **If the node is unstable but not resyncing, restart it**
            const message = `⚠️ Node status issue: ${reason}. Local height: ${localNode.evmHeight}, Chain height: ${chainListNode.maxHeight}. Attempting to restart...`;
            logger.warn(message);
            await sendEmail('⚠️ Node Out of Sync Alert', message);
            await restartNode()
                .then(() => logger.info('✅ Node restarted successfully'))
                .catch(err => logger.error('❌ Failed to restart node:', err));
            return;
        }

        // **If the node is stable, check if the height difference is within the acceptable range**
        const heightDiff = Math.abs(localNode.evmHeight - chainListNode.maxHeight);
        if (heightDiff > config.HEIGHT_DIFF_THRESHOLD) {
            const message = `⚠️ Height difference exceeded threshold: ${heightDiff}. Local height: ${localNode.evmHeight}, Chain height: ${chainListNode.maxHeight}. Attempting to restart...`;
            logger.warn(message);
            await sendEmail('⚠️ Node Height Difference Alert', message);
            await restartNode()
                .then(() => logger.info('✅ Node restarted successfully'))
                .catch(err => logger.error('❌ Failed to restart node:', err));
            return;
        }

        // **Only check StateRoot if the local height matches the chain height**
        if (localNode.evmHeight === chainListNode.maxHeight && !isStateRootMatching) {
            const message = `⚠️ StateRoot mismatch detected! Local: ${localNode.evmStateRoot}, Chain: ${chainListNode.stateRoot}`;
            logger.warn(message);
            await sendEmail('⚠️ StateRoot Mismatch Alert', message);
            await restartNode()
                .then(() => logger.info('✅ Node restarted successfully'))
                .catch(err => logger.error('❌ Failed to restart node:', err));
            return;
        }

        // **Check for block generation lag**
        await detectBlockGenerationLag(localNode.height);

        logger.info('✅ Node is running normally.');
    } catch (error) {
        const errorMessage = `❌ Monitoring task failed: ${error.message}`;
        logger.error(errorMessage);
        throw error;
    }
}

/**
 * Detects if block generation is lagging.
 */
const lastCheckTimes = [];
const lastHeights = [];
let lastRestartTime = 0;
const RESTART_THRESHOLD_MINUTES = 10;

async function detectBlockGenerationLag(currentHeight) {
    const now = Date.now();
    lastHeights.push(currentHeight);
    lastCheckTimes.push(now);

    if (lastHeights.length > 2) {
        lastHeights.shift();
        lastCheckTimes.shift();
    }

    if (lastHeights.length === 2) {
        const heightDiff = lastHeights[1] - lastHeights[0];
        const timeDiff = (lastCheckTimes[1] - lastCheckTimes[0]) / 1000 / 60;
        const blockRate = heightDiff / timeDiff;

        if (blockRate < 0.8) {
            const message = `⚠️ Block generation lag detected! Block rate too low: ${blockRate.toFixed(2)} blocks/min. Height history: ${lastHeights.join(', ')}`;
            logger.warn(message);
            await sendEmail('⚠️ Block Generation Lag Alert', message);
        }

        if (heightDiff === 0) {
            if (now - lastRestartTime > RESTART_THRESHOLD_MINUTES * 60 * 1000) {
                logger.error(`🚨 No new blocks for ${timeDiff.toFixed(2)} minutes. Restarting QNG node...`);
                await sendEmail('🚨 QNG Node Restart Alert', `No new blocks detected for ${timeDiff.toFixed(2)} minutes. Restarting node...`);

                await restartNode();
                lastRestartTime = now;
            } else {
                logger.warn(`⚠️ Block generation stopped, but restart cooldown active.`);
            }
        }
    }
}


module.exports = {monitor};
