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
        return response.data.result;
    } catch (error) {
        console.error(`Error fetching data from ${rpcUrl}:`, error.message);
        throw error;
    }
}


async function getBlockByNumber(rpcUrl) {
    const requestData = {
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", false],
        id: 1,
    };

    const blockData = await sendJsonRpcRequest(rpcUrl, requestData);

    if (!blockData) {
        console.error(`No block data returned from ${rpcUrl}`);
        return null;
    }

    return {
        height: parseInt(blockData.number, 16),
        stateroot: blockData.stateRoot || null,
        blockData,
    };
}

module.exports = { getBlockByNumber };
