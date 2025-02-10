const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { getQitmeerStateRoot } = require("./qitmeerApiService");


async function compareNodeStatus(chainListNode) {
    try {
        const localNode = await getQitmeerStateRoot(config.NODE_URL);
        const isHeightSynced = Math.abs(localNode.evmHeight - chainListNode.maxHeight) <= config.syncThreshold;
        let isStateRootMatching = true;
        if (localNode.evmHeight === chainListNode.maxHeight) {
            isStateRootMatching = localNode.evmStateRoot === chainListNode.stateRoot;
        }
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


module.exports = { compareNodeStatus };
