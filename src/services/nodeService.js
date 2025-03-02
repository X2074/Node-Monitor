const config = require('../config');
const logger = require('../utils/logger');
const {getQitmeerStateRoot} = require("./qitmeerApiService");

// Stores the recent N heights
const heightHistory = [];
const chainHeightHistory = [];

/**
 * Updates the history of local and chain heights.
 */
function updateHeightHistory(currentHeight, chainHeight) {
    // Record local node height
    heightHistory.push(currentHeight);
    if (heightHistory.length > config.MAX_HISTORY) {
        heightHistory.shift();
    }

    // Record chain height
    chainHeightHistory.push(chainHeight);
    if (chainHeightHistory.length > config.MAX_HISTORY) {
        chainHeightHistory.shift();
    }
}

/**
 * Checks if the local node height is stuck.
 */
function checkHeightStuck(currentHeight) {
    if (heightHistory.length >= config.STUCK_THRESHOLD) {
        const stuck = heightHistory.every(h => h === currentHeight);
        if (stuck) {
            logger.warn(`⚠️ Local node height is stuck (${currentHeight}), possible node failure!`);
            return {
                isStable: false,
                reason: "Height Stuck"
            };
        }
    }
    return null;
}

/**
 * Calculates the synchronization rate of the local node and the chain.
 */
function calculateSyncRate() {
    const localSyncRate = (heightHistory[heightHistory.length - 1] - heightHistory[0]) / (config.MAX_HISTORY - 1);
    const chainSyncRate = (chainHeightHistory[chainHeightHistory.length - 1] - chainHeightHistory[0]) / (config.MAX_HISTORY - 1);
    return {localSyncRate, chainSyncRate};
}

/**
 * Detects whether the node is undergoing resynchronization (i.e., a large jump in local height).
 */
function checkResyncing(currentHeight) {
    if (heightHistory.length < config.MAX_HISTORY) {
        return null; // Not enough data to determine yet
    }

    const jumpAmount = currentHeight - heightHistory[heightHistory.length - 2];
    if (jumpAmount >= config.JUMP_THRESHOLD) {
        logger.warn(`⚠️ Local node height jumped by ${jumpAmount}, likely undergoing resynchronization!`);
        return {
            isStable: false,
            reason: "Resyncing"
        };
    }

    // Calculate synchronization rates
    const {localSyncRate, chainSyncRate} = calculateSyncRate();

    // If the local sync rate is significantly higher than the chain growth rate, assume resyncing
    if (localSyncRate > 2 * chainSyncRate) {
        logger.warn(`⚠️ Local sync rate is too high, possible resyncing: Local rate ${localSyncRate.toFixed(2)}, Chain rate ${chainSyncRate.toFixed(2)}`);
        return {
            isStable: false,
            reason: "Resyncing"
        };
    }

    return null;
}

/**
 * Checks if the node is syncing properly.
 */
function checkSyncStatus(currentHeight, chainHeight) {
    const isHeightSynced = currentHeight >= chainHeight * config.SYNC_THRESHOLD_PERCENT;

    if (isHeightSynced) {
        logger.info(`✅ Local node is stable: Height ${currentHeight}, Chain height ${chainHeight}`);
        return {isStable: true, reason: "Stable"};
    } else {
        logger.warn(`⚠️ Local node is unstable: Height ${currentHeight}, Chain height ${chainHeight}`);
        return {isStable: false, reason: "Not Stable"};
    }
}

/**
 * Main method: Compares the local node and chain status.
 */
async function compareNodeStatus(chainListNode) {
    try {
        const localNode = await getQitmeerStateRoot(config.NODE_URL);
        const currentHeight = localNode.evmHeight;
        const chainHeight = chainListNode.maxHeight;

        // Update history records
        updateHeightHistory(currentHeight, chainHeight);

        // Check if the node is stuck
        let result = checkHeightStuck(currentHeight);
        if (result) {
            return {...result, localNode, isStateRootMatching: false};
        }

        // Calculate sync rates
        const {localSyncRate, chainSyncRate} = calculateSyncRate();

        // Detect if resyncing
        result = checkResyncing(currentHeight);
        if (result) {
            return {...result, localNode, isStateRootMatching: false};
        }

        // Check sync status
        result = checkSyncStatus(currentHeight, chainHeight, localSyncRate, chainSyncRate);
        if (!result.isStable) {
            return {...result, localNode, isStateRootMatching: false};
        }

        // Only check StateRoot when local height matches chain height
        let isStateRootMatching = "N/A"; // Default: do not check
        if (currentHeight === chainHeight) {
            isStateRootMatching = localNode.evmStateRoot === chainListNode.stateRoot;
        }

        return {
            ...result,
            localNode,
            isStateRootMatching
        };

    } catch (error) {
        logger.error(`❌ Monitoring error: ${error.message}`);
        throw error;
    }
}

module.exports = {compareNodeStatus};
