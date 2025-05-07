const axios = require('axios');
const config = require('../config');
const logger = require("../utils/core/logger");

/**
 * Sends an RPC request to the given URL.
 * @param {string} rpcUrl - The URL of the RPC endpoint.
 * @param {Object} requestData - The request data to send.
 * @param {Object} [auth=null] - Optional authentication object.
 * @returns {Object} - The result of the RPC request.
 */
async function sendJsonRpcRequest(rpcUrl, requestData, auth = null) {
    try {
        const options = {
            headers: {'Content-Type': 'application/json'},
            httpsAgent: new (require('https').Agent)({rejectUnauthorized: false}),
        };

        if (auth) {
            options.auth = auth;
        }

        const response = await axios.post(rpcUrl, requestData, options);
        logger.info(`Received response from ${rpcUrl}:`, response.data);
        return response.data.result;
    } catch (error) {
        logger.error(`Error fetching data from ${rpcUrl}:`, error.message);
        throw error;
    }
}

/**
 * Returns the authentication object for Qitmeer RPC requests.
 * @returns {Object} - The authentication object containing username and password.
 */
function getAuth() {
    return {
        username: config.qitmeer.username,
        password: config.qitmeer.password,
    };
}

module.exports = {sendJsonRpcRequest, getAuth};
