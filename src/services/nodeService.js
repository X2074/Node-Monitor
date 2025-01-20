const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

async function getLocalNodeStatus() {
    try {
        const response = await axios.get(`${config.nodeUrl}/status`);
        logger.info('Fetched local node status successfully.');
        return response.data;
    } catch (error) {
        logger.error(`Error fetching local node status: ${error.message}`);
        throw new Error('Failed to fetch local node status');
    }
}


async function compareNodeStatus(chainListNode) {
    try {

        const localNode = await getLocalNodeStatus();

        const isHeightSynced = Math.abs(localNode.height - chainListNode.height) <= config.syncThreshold;

        const isStateRootMatching = localNode.stateroot === chainListNode.stateroot;

        return {
            isHeightSynced,
            localNode,
            isStateRootMatching,
        };
    } catch (error) {
        logger.error(`Error comparing node statuses: ${error.message}`);
        throw error;
    }
}


module.exports = {compareNodeStatus};
