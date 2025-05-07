const logger = require('../../utils/core/logger');
const chainDataService = require('../node/chainDataService');
const {compareNodeStatus} = require('../node/nodeStatusService');
const {restartNode} = require('../../utils/system/restart');
const {sendAndRecordEmail} = require('../mail/senders');
const {detectBlockGenerationLag} = require('./utxoHealthService');
const config = require("../../config");
const {insertMonitorLog} = require('../../database/tables/monitorLogger');
const {getNodeInfo} = require('../../api/rpc_local');
const {insertConnectionLog} = require('../../database/tables/connectionLogger');
const {insertNodeMeta} = require('../../database/tables/nodeMetaLogger');
const {insertNodeStatusLog} = require('../../database/tables/nodeStatusLogger');

// Collects and validates chain data
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

// Main monitoring function that checks node health and performs actions
async function monitor() {
    try {
        const chainListNode = await collectAndValidateChainData();
        if (!chainListNode) {
            await insertMonitorLog('error', 'dataCollection', {reason: 'collectHeights failed or returned incomplete'});
            return;
        }

        const {isStable, isStateRootMatching, localNode, reason} = await compareNodeStatus(chainListNode);

        await recordNodeMetadataIfChanged();

        // If the node is resyncing, skip further checks
        if (!isStable && reason === "Resyncing") {
            logger.info(`⏳ Node is resyncing: ${reason}. Local height: ${localNode.evmHeight}, Chain height: ${chainListNode.maxHeight}. Skipping further checks.`);
            await insertMonitorLog('warn', 'resyncSkip', {
                reason,
                localHeight: localNode.evmHeight,
                chainHeight: chainListNode.maxHeight
            });
            return;
        }

        // If the node is unstable, alert and attempt to restart
        if (!isStable) {
            const type = 'nodeSyncAlert';
            const payload = {
                chainHeight: chainListNode.maxHeight,
                localHeight: localNode.evmHeight,
                reason: 'Sync Issue Detected',
            };
            await handleAlert(type, payload);
            await attemptNodeRestart();
            return;
        }

        // If the height difference exceeds threshold, alert and attempt to restart
        const heightDiff = Math.abs(localNode.evmHeight - chainListNode.maxHeight);
        if (heightDiff > config.HEIGHT_DIFF_THRESHOLD) {
            const type = 'nodeHeightDifferenceAlert';
            const payload = {
                localHeight: localNode.evmHeight,
                chainHeight: chainListNode.maxHeight,
                heightDiff: heightDiff,
            };
            await handleAlert(type, payload);
            await attemptNodeRestart();
            return;
        }

        // If stateRoot is mismatched, alert and attempt to restart
        if (localNode.evmHeight === chainListNode.maxHeight && !isStateRootMatching) {
            const type = 'stateRootMismatchAlert';
            const payload = {
                localStateRoot: localNode.evmStateRoot,
                chainStateRoot: chainListNode.stateRoot,
            };
            await handleAlert(type, payload);
            await attemptNodeRestart();
            return;
        }

        // Check for block generation lag
        if (config.BLOCK_LAG_CHECK) {
            await detectBlockGenerationLag(localNode.height);
        }

        await insertMonitorLog('ok', 'nodeHealthy', {
            localHeight: localNode.evmHeight,
            chainHeight: chainListNode.maxHeight,
            stateRootOk: isStateRootMatching
        });

        logger.info('✅ Node is running normally.');
    } catch (error) {
        logger.error(`❌ Monitoring task failed: ${error.message}`);
        await insertMonitorLog('error', 'monitorFailure', {message: error.message});
    }
}

// Handles alerts by sending email and logging the alert
async function handleAlert(type, payload) {
    await sendAndRecordEmail(type, payload);
    await insertMonitorLog('error', type, payload);
}

// Attempts to restart the node
async function attemptNodeRestart() {
    await restartNode()
        .then(() => logger.info('✅ Node restarted successfully'))
        .catch(err => logger.error('❌ Failed to restart node:', err));
}

let lastVersion = null;
let lastNetwork = null;

/**
 * Records node metadata only when buildversion or network changes
 */
async function recordNodeMetadataIfChanged() {
    const nodeInfo = await getNodeInfo(config.NODE_URL);

    // Always record connection info
    if (nodeInfo.connections !== undefined) {
        await insertConnectionLog(nodeInfo);
    }

    // Only record node version/network info if changed
    if (nodeInfo.buildversion !== lastVersion || nodeInfo.network !== lastNetwork) {
        lastVersion = nodeInfo.buildversion;
        lastNetwork = nodeInfo.network;

        await insertNodeMeta(nodeInfo);
        logger.info(`📝 Node metadata changed: version=${nodeInfo.buildversion}, network=${nodeInfo.network}`);
    }
    // Always record node status
    await insertNodeStatusLog(nodeInfo);
}
module.exports = {monitor};
