import logger from '../utils/core/logger';
import { sendJsonRpcRequest } from './rpc_base';
import config from '../config';
import { axiosGetSmart } from '../utils/core/proxyAxios';

// Interface representing a block from the Ethereum-like blockchain
interface EthBlock {
    number: string; // Block number in hexadecimal format
    stateRoot?: string; // Optional state root

    [key: string]: any; // Additional properties
}

// Structure for the result of block data retrieval
interface BlockResult {
    height: number;
    stateroot: string | null;
    blockData: EthBlock;
}

// Structure for the response containing RPC endpoints
interface ChainDataResponse {
    rpc?: string[];

    [key: string]: any;
}

/**
 * Fetch the latest block data from a blockchain RPC node.
 * @param rpcUrl - The RPC URL of the blockchain node.
 * @returns An object containing block height, state root, and raw block data, or null on failure.
 */
export async function getBlockByNumber(rpcUrl: string): Promise<BlockResult | null> {
    const requestData = {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
        id: 1,
    };

    const blockData = await sendJsonRpcRequest<EthBlock>(rpcUrl, requestData);

    if (!blockData) {
        logger.error(`No block data returned from ${rpcUrl}`);
        return null;
    }

    return {
        height: parseInt(blockData.number, 16),
        stateroot: blockData.stateRoot || null,
        blockData,
    };
}

/**
 * Construct the URL used to fetch chain-specific configuration data.
 * @returns The fully formatted URL.
 */
function getChainDataUrl(): string {
    const format = config.CHAIN_DATA.FORMAT.replace('{chainId}', config.CHAIN_DATA.CHAIN_ID);
    return `${config.CHAIN_DATA.BASE}${format}`;
}

/**
 * Retrieve a list of RPC node URLs for a specific chain ID from the configured data source.
 * @returns An array of RPC endpoint strings.
 */
export async function getRPCByChainId(): Promise<string[]> {
    const url = getChainDataUrl();
    try {
        const { data } = await axiosGetSmart<ChainDataResponse>(url);
        logger.info(`✅ Retrieved RPC list from ${url}:`);
        logger.debug(JSON.stringify(data.rpc, null, 2));
        return data.rpc || [];
    } catch (error: any) {
        logger.error(`Axios error: ${error.message}`);
        return [];
    }
}
