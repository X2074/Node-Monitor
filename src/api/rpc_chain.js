const logger = require("../utils/logger");
const {sendJsonRpcRequest} = require('../api/rpc_base');
const config = require("../config");
const {axiosGetSmart} = require('../utils/proxyAxios');

async function getBlockByNumber(rpcUrl) {
    const requestData = {
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", false],
        id: 1,
    };

    const blockData = await sendJsonRpcRequest(rpcUrl, requestData);

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

function getChainDataUrl() {
    const format = config.CHAIN_DATA.FORMAT.replace('{chainId}', config.CHAIN_DATA.CHAIN_ID);
    return `${config.CHAIN_DATA.BASE}${format}`;
}

async function getRPCByChainId() {
    const url = getChainDataUrl();
    try {
        const {data} = await axiosGetSmart(url);
        return data.rpc || [];
    } catch (error) {
        logger.error(`Axios error: ${error.message}`);
        return [];
    }
}


module.exports = {getBlockByNumber, getRPCByChainId};
