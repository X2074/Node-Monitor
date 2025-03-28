const {getBlockByNumber, getRPCByChainId} = require('../../api/rpc_chain');
const logger = require("../../utils/logger");


async function collectHeights() {
    const rpcUrls = await getRPCByChainId();
    let maxHeight = 0;
    let maxStateRoot = null;
    let maxBlockData = null;

    for (const rpcUrl of rpcUrls) {
        try {
            const chainListNode = await getBlockByNumber(rpcUrl);

            if (chainListNode) {
                const {height, stateroot, blockData} = chainListNode;
                logger.info(`RPC: ${rpcUrl} - Latest Block Height: ${height}, State Root: ${stateroot}`);
                if (height > maxHeight) {
                    maxHeight = height;
                    maxStateRoot = stateroot;
                    maxBlockData = blockData;
                }
            } else {
                logger.info(`Failed to fetch data for RPC: ${rpcUrl}`);
            }
        } catch (error) {
            logger.error(`Error fetching data for RPC: ${rpcUrl} - ${error.message}`);
        }
    }

    logger.info(`Max Height: ${maxHeight}, State Root: ${maxStateRoot}`);
    return {maxHeight, stateRoot: maxStateRoot, blockData: maxBlockData};
}


module.exports = {collectHeights};
