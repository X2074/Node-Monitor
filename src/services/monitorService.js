const logger = require('../utils/logger');
const { compareNodeStatus } = require('./nodeService');
const { restartNode } = require('./restartService');
const { sendEmail } = require('./mailService');


async function monitor(chainListNode) {
    try {
        const { isHeightSynced, isStateRootMatching, localNode } = await compareNodeStatus(chainListNode);
        if (!isHeightSynced) {
            const message = `Node out of sync. Local height: ${localNode.evmHeight}, Chainlist height: ${chainListNode.maxHeight}. 
            Attempting to restart. `;
            logger.warn(message);
            await sendEmail('Node out of sync Alert', message);
            await restartNode()
                .then(() => console.log('Node restarted successfully.'))
                .catch(err => console.error('Failed to restart node:', err));
        }
        if (!isStateRootMatching) {
            const message = `State root mismatch detected. Local stateroot: ${localNode.evmStateRoot}, 
            Chainlist stateroot: ${chainListNode.stateRoot} `;
            logger.warn(message);
            await sendEmail('State Root Mismatch Alert', message);
            await restartNode()
                .then(() => console.log('Node restarted successfully.'))
                .catch(err => console.error('Failed to restart node:', err));
        }
        await detectBlockGenerationLag(localNode.height);
        logger.info('Node is in sync and running correctly.');
    } catch (error) {
        const errorMessage = `Monitor task failed: ${error.message}`;
        logger.error(errorMessage);
        throw error;
    }
}


const lastHeights = [];

async function detectBlockGenerationLag(currentHeight) {
    lastHeights.push(currentHeight);

    if (lastHeights.length > 2) {
        lastHeights.shift();
    }

    if (lastHeights.length === 2) {
        const diff1 = lastHeights[1] - lastHeights[0];
        if (diff1 >= 15) {
            const message = `Block generation lag detected. Height differences are too small.
            Differences: [${diff1}]. Heights: ${lastHeights.join(', ')}`;
            console.warn(message);

            await sendEmail('Block Generation Lag Alert', message);
            await restartNode()
                .then(() => console.log('Node restarted successfully.'))
                .catch(err => console.error('Failed to restart node:', err));
        }
    }
}

module.exports = { monitor };
