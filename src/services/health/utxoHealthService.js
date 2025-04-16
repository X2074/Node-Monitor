const { sendAndRecordEmail } = require('../mail/senders');
const config = require('../../config');

const lastCheckTimes = [];
const lastHeights = [];

async function detectBlockGenerationLag(currentHeight) {
    const now = Date.now();
    lastHeights.push(currentHeight);
    lastCheckTimes.push(now);

    if (lastHeights.length > 2) {
        lastHeights.shift();
        lastCheckTimes.shift();
    }

    if (lastHeights.length === 2) {
        const heightDiff = lastHeights[1] - lastHeights[0];
        const timeDiff = (lastCheckTimes[1] - lastCheckTimes[0]) / 1000 / 60;
        const blockRate = heightDiff / timeDiff;

        if (blockRate < config.BLOCK_RATE_THRESHOLD) {
            await sendAndRecordEmail('blockGenerationLagAlert', {
                blockRate: blockRate.toFixed(2),
                heightHistory: lastHeights.join(', '),
            });
        }

        if (heightDiff === 0) {
            await sendAndRecordEmail('blockGenerationStoppedAlert', {
                timeDiff: timeDiff.toFixed(2),
                heightHistory: lastHeights.join(', '),
            });
        }
    }
}

module.exports = { detectBlockGenerationLag };
