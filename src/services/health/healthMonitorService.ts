import logger from '../../utils/core/logger';
import chainDataService from '../node/chainDataService';
import {compareNodeStatus} from '../node/nodeStatusService';
import {restartNode} from '../../utils/system/restart';
import {sendAndRecordEmail} from '../mail/senders';
import {detectBlockGenerationLag} from './utxoHealthService';
import config from '../../config';
import {insertMonitorLog} from '../../database/tables/monitorLogger';
import {getNodeInfo} from '../../api/rpc_local';
import {insertConnectionLog} from '../../database/tables/connectionLogger';
import {insertNodeMeta} from '../../database/tables/nodeMetaLogger';
import {insertNodeStatusLog} from '../../database/tables/nodeStatusLogger';

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
    } catch (error: any) {
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
    } catch (err: any) {
        logger.error(`❌ Monitoring task failed: ${err.message || err}`);
        await insertMonitorLog('error', 'monitorFailure', {message: err.message});
    }
}

// Handles alerts by sending email and logging the alert
async function handleAlert(type: string, payload: Record<string, any>) {
    try {
        await sendAndRecordEmail(type, payload);
    } catch (e) {
        logger.error(`❌ Failed to send alert email for ${type}:`, e);
    }

    try {
        await insertMonitorLog('error', type, payload);
    } catch (e) {
        logger.error(`❌ Failed to log monitor alert for ${type}:`, e);
    }
}


// Attempts to restart the node
async function attemptNodeRestart() {
    await restartNode()
        .then(() => logger.info('✅ Node restarted successfully'))
        .catch(err => logger.error(`❌ Failed to restart node: ${err.message || err}`));
}

let lastVersion: string = "";
let lastNetwork: string = "";


/**
 * Records node metadata only when buildversion or network changes
 */
async function recordNodeMetadataIfChanged() {
    try {
        const nodeInfo = await getNodeInfo(config.NODE_URL);

        if (nodeInfo.connections !== undefined) {
            await insertConnectionLog(nodeInfo);
        }

        if (nodeInfo.buildversion !== lastVersion || nodeInfo.network !== lastNetwork) {
            lastVersion = nodeInfo.buildversion;
            lastNetwork = nodeInfo.network;

            await insertNodeMeta(nodeInfo);
            logger.info(`📝 Node metadata changed: version=${nodeInfo.buildversion}, network=${nodeInfo.network}`);
        }

        await insertNodeStatusLog(nodeInfo);
    } catch (err: any) {
        logger.warn(`⚠️ Failed to record node metadata: ${err.message || err}`);
    }
}

export default {monitor};
