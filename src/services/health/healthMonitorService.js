const logger = require('../../utils/logger');
const chainDataService = require('../node/chainDataService'); // 引入数据收集服务
const {compareNodeStatus} = require('../node/nodeStatusService');
const {restartNode} = require('../../utils/restart');
const {sendEmail} = require('../mail/mailService');
const {detectBlockGenerationLag} = require('./utxoHealthService');
const config = require("../../config");

async function collectAndValidateChainData() {
    try {
        const {maxHeight, stateRoot, blockData} = await chainDataService.collectHeights();
        if (maxHeight && stateRoot && blockData) {
            logger.info('Chain data collected successfully.');
            return {maxHeight, stateRoot, blockData};
        } else {
            logger.error('Incomplete data in cache. Ensure data is being cached correctly.');
            return null;
        }
    } catch (error) {
        logger.error(`Error collecting chain data: ${error.message}`);
        return null;
    }
}

/**
 * Monitors the node status to ensure its stability.
 */
async function monitor() {
    try {
        const chainListNode = await collectAndValidateChainData();
        if (!chainListNode) {
            logger.error('Data collection failed. Skipping node monitoring.');
            return;
        }
        // Call compareNodeStatus to get the node status
        const {isStable, isStateRootMatching, localNode, reason} = await
            compareNodeStatus(chainListNode);
        // **If the node is unstable**
        if (!isStable) {
            // **If the node is resyncing, skip further checks**
            if (reason === "Resyncing") {
                logger.info(`⏳ Node is resyncing: ${reason}. Local height: ${localNode.evmHeight}, Chain height: ${chainListNode.maxHeight}. Skipping further checks.`);
                return;
            }
            // **If the node is unstable but not resyncing, restart it**
            await sendEmail('nodeSyncAlert', {
                chainHeight: chainListNode.maxHeight,
                localHeight: localNode.evmHeight,
                reason: 'Sync Issue Detected',
            });
            await attemptNodeRestart();
            return;
        }

        // **If the node is stable, check if the height difference is within the acceptable range**
        const heightDiff = Math.abs(localNode.evmHeight - chainListNode.maxHeight);
        if (heightDiff > config.HEIGHT_DIFF_THRESHOLD) {
            await sendEmail('nodeHeightDifferenceAlert', {
                localHeight: localNode.evmHeight,
                chainHeight: chainListNode.maxHeight,
                heightDiff: heightDiff,
            });
            await attemptNodeRestart();
            return;
        }

        // **Only check StateRoot if the local height matches the chain height**
        if (localNode.evmHeight === chainListNode.maxHeight && !isStateRootMatching) {
            await sendEmail('stateRootMismatchAlert', {
                localStateRoot: localNode.evmStateRoot,
                chainStateRoot: chainListNode.stateRoot,
            });
            await attemptNodeRestart();
            return;
        }

        // **Check for block generation lag**
        if (config.BLOCK_LAG_CHECK) {
            await detectBlockGenerationLag(localNode.height);
        }
        logger.info('✅ Node is running normally.');
    } catch (error) {
        logger.error(`❌ Monitoring task failed: ${error.message}`);
        throw error;
    }
}

async function attemptNodeRestart() {
    await restartNode()
        .then(() => logger.info('✅ Node restarted successfully'))
        .catch(err => logger.error('❌ Failed to restart node:', err));
}


module.exports = {monitor};
