const {sendJsonRpcRequest, getAuth} = require('../api/rpc_base');
const logger = require("../utils/logger");

async function getLocalStateRoot(rpcUrl) {

    const order = await getLocalBlockCount(rpcUrl);

    const requestData = {
        jsonrpc: '2.0',
        method: 'getStateRoot',
        params: [order - 10, true],
        id: 1,
    };
    logger.info('Fetching state root...');
    const result = await sendJsonRpcRequest(rpcUrl, requestData, getAuth());
    logger.info(`State root received:`, result);

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

async function getLocalBlockCount(rpcUrl) {

    const requestData = {
        jsonrpc: '2.0',
        method: 'getBlockCount',
        params: [],
        id: 1,
    };

    logger.info('Fetching block count...');
    const result = await sendJsonRpcRequest(rpcUrl, requestData, getAuth());
    logger.info(`Block count received: ${result}`);
    return result;
}

module.exports = {getLocalStateRoot};
