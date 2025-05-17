import config from '../../config';
import logger from '../../utils/core/logger';
import { getLocalStateRoot } from '../../api/rpc_local';
import HeightHistory from '../health/blockHeightHistory';

interface ChainListNode {
    maxHeight: number;
    stateRoot: string;
}

interface NodeStatusResult {
    isStable: boolean;
    reason: string;
    localNode: any;
    isStateRootMatching: boolean | string; // "N/A" if not checked
    localSyncRate: number;
    chainSyncRate: number;
}

const heightHistoryManager = new HeightHistory(config.MAX_HISTORY);

function updateHeightHistory(currentHeight: number, chainHeight: number) {
    heightHistoryManager.updateHistory(currentHeight, chainHeight);
}

function calculateSyncRate() {
    return heightHistoryManager.calculateSyncRate();
}

function checkHeightStuck(currentHeight: number): NodeStatusResult | null {
    const history = heightHistoryManager.getHeightHistory();

    if (history.length >= config.STUCK_THRESHOLD) {
        const stuck = history.every(h => h === currentHeight);
        if (stuck) {
            logger.warn(`⚠️ Height stuck at ${currentHeight}`);
            const { localSyncRate, chainSyncRate } = calculateSyncRate();
            return {
                isStable: false,
                reason: 'Height Stuck',
                localNode: {},
                isStateRootMatching: false,
                localSyncRate,
                chainSyncRate
            };
        }
    }
    return null;
}

function checkResyncing(currentHeight: number): NodeStatusResult | null {
    const history = heightHistoryManager.getHeightHistory();

    if (history.length < config.MAX_HISTORY) return null;

    const jumpAmount = currentHeight - history[history.length - 2];
    const { localSyncRate, chainSyncRate } = calculateSyncRate();

    if (jumpAmount >= config.JUMP_THRESHOLD) {
        logger.warn(`⚠️ Height jump detected: +${jumpAmount}`);
        return {
            isStable: false,
            reason: 'Resyncing (jump)',
            localNode: {},
            isStateRootMatching: false,
            localSyncRate,
            chainSyncRate
        };
    }

    if (localSyncRate > 2 * chainSyncRate) {
        logger.warn(`⚠️ Local sync rate too high (${localSyncRate.toFixed(2)} > 2×${chainSyncRate.toFixed(2)})`);
        return {
            isStable: false,
            reason: 'Resyncing (sync rate)',
            localNode: {},
            isStateRootMatching: false,
            localSyncRate,
            chainSyncRate
        };
    }

    return null;
}

function checkSyncStatus(currentHeight: number, chainHeight: number): NodeStatusResult {
    const isHeightSynced = currentHeight >= chainHeight * config.SYNC_THRESHOLD_PERCENT;
    const { localSyncRate, chainSyncRate } = calculateSyncRate();

    if (isHeightSynced) {
        logger.info(`✅ Node synced: Local=${currentHeight}, Chain=${chainHeight}`);
        return {
            isStable: true,
            reason: 'Stable',
            localNode: {},
            isStateRootMatching: 'N/A',
            localSyncRate,
            chainSyncRate
        };
    } else {
        logger.warn(`⚠️ Node not synced: Local=${currentHeight}, Chain=${chainHeight}`);
        return {
            isStable: false,
            reason: 'Not Stable',
            localNode: {},
            isStateRootMatching: false,
            localSyncRate,
            chainSyncRate
        };
    }
}

export async function compareNodeStatus(chainListNode: ChainListNode): Promise<NodeStatusResult> {
     try {
        const localNode = await getLocalStateRoot(config.NODE_URL);
        const currentHeight = localNode.evmHeight;
        const chainHeight = chainListNode.maxHeight;

        updateHeightHistory(currentHeight, chainHeight);

        let result: NodeStatusResult | null;

        result = checkHeightStuck(currentHeight);
        if (result) return { ...result, localNode };

        result = checkResyncing(currentHeight);
        if (result) return { ...result, localNode };

        result = checkSyncStatus(currentHeight, chainHeight);
        if (!result.isStable) return { ...result, localNode };

        const isStateRootMatching =
            currentHeight === chainHeight
                ? localNode.evmStateRoot === chainListNode.stateRoot
                : 'N/A';

        return {
            ...result,
            localNode,
            isStateRootMatching
        };

    } catch (error: unknown) {
        const message =
            error && typeof error === 'object' && 'message' in error
                ? (error as any).message
                : 'Unknown error';

        logger.error(`❌ Monitoring error: ${message}`);
        throw error;
    }
}

