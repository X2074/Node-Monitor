import {getAuth, sendJsonRpcRequest} from './rpc_base';
import logger from '../utils/core/logger';

/**
 * State root structure returned by Qitmeer node (JSON RPC)
 * Example:
 * {
 *   "jsonrpc": "2.0",
 *   "id": 1,
 *   "result": {
 *     "Hash": "...",
 *     "Order": 3223632,
 *     "Height": 2874544,
 *     "Valid": true,
 *     "EVMStateRoot": "...",
 *     "EVMHeight": 1629050,
 *     "EVMHead": "...",
 *     "StateRoot": "..."
 *   }
 * }
 */

interface StateRootResult {
    Hash: string;
    Order: number;
    Height: number;
    Valid: boolean;
    EVMStateRoot: string;
    EVMHeight: number;
    EVMHead: string;
    StateRoot: string;
}


/**
 * Structurized state root information
 */

interface ParsedStateRoot {
    hash: string;
    order: number;
    height: number;
    isValid: boolean;
    evmStateRoot: string;
    evmHeight: number;
    evmHead: string;
    stateRoot: string;
}

/**
 * Get the latest state root (from current block height - 10)
 */
export async function getLocalStateRoot(rpcUrl: string): Promise<ParsedStateRoot> {
    const order = await getLocalBlockCount(rpcUrl);

    const requestData = {
        jsonrpc: '2.0',
        method: 'getStateRoot',
        params: [order - 10, true],
        id: 1,
    };

    logger.debug('Fetching state root...');
    const result = await sendJsonRpcRequest<StateRootResult>(rpcUrl, requestData, getAuth());
    logger.debug('State ro received:\n' + JSON.stringify(result, null, 2));

    return {
        hash: result.Hash,
        order: result.Order,
        height: result.Height,
        isValid: result.Valid,
        evmStateRoot: result.EVMStateRoot,
        evmHeight: result.EVMHeight,
        evmHead: result.EVMHead,
        stateRoot: result.StateRoot,
    };
}

/**
 * Get current local block height (order)
 */
export async function getLocalBlockCount(rpcUrl: string): Promise<number> {
    const requestData = {
        jsonrpc: '2.0',
        method: 'getBlockCount',
        params: [],
        id: 1,
    };

    logger.debug('Fetching block count...');
    const result = await sendJsonRpcRequest<number>(rpcUrl, requestData, getAuth());
    logger.debug('Block count received:\n' + JSON.stringify(result, null, 2));
    return result;
}

/**
 * Get basic node information
 */
export async function getNodeInfo(rpcUrl: string): Promise<any> {
    const requestData = {
        jsonrpc: '2.0',
        method: 'getNodeInfo',
        params: [],
        id: 1,
    };

    logger.debug('Fetching node info...');
    const result = await sendJsonRpcRequest<any>(rpcUrl, requestData, getAuth());
    logger.debug('Node info received:\n' + JSON.stringify(result, null, 2));
    return result;
}

