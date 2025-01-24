const axios = require('axios');
const config = require('../config');

async function sendJsonRpcRequest(rpcUrl, requestData, auth = null) {
    try {
        const options = {
            headers: { 'Content-Type': 'application/json' },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
        };

        if (auth) {
            options.auth = auth;
        }

        const response = await axios.post(rpcUrl, requestData, options);
        console.log(`Received response from ${rpcUrl}:`, response.data);
        return response.data.result;
    } catch (error) {
        console.error(`Error fetching data from ${rpcUrl}:`, error.message);
        throw error;
    }
}


async function getQitmeerStateRoot(rpcUrl) {
    const auth = {
        username: config.qitmeer.username,
        password: config.qitmeer.password,
    };

    const order = await getQitmeerBlockCount(rpcUrl);

    const requestData = {
        jsonrpc: '2.0',
        method: 'getStateRoot',
        params: [order-10, true],
        id: 1,
    };
    console.log('Fetching state root...');
    const result = await sendJsonRpcRequest(rpcUrl, requestData, auth);
    console.log(`State root received:`, result);

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

async function getQitmeerBlockCount(rpcUrl) {
    const auth = {
        username: config.qitmeer.username,
        password: config.qitmeer.password,
    };

    const requestData = {
        jsonrpc: '2.0',
        method: 'getBlockCount',
        params: [],
        id: 1,
    };

    console.log('Fetching block count...');
    const result = await sendJsonRpcRequest(rpcUrl, requestData, auth);
    console.log(`Block count received: ${result}`);
    return result;
}

module.exports = {  getQitmeerStateRoot, getQitmeerBlockCount };
