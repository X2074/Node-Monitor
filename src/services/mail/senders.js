const {sendEmail} = require('./mailService');
const {insertAlert, getContentHash, shouldSendAlert} = require('../../database/tables/alertRecorder');
const logger = require('../../utils/logger');

/**
 * Send email and insert alert record if not duplicate.
 */
async function sendAndRecordEmail(type, payload) {
    const hash = getContentHash(type, payload);
    const shouldSend = await shouldSendAlert(type, payload);
    if (!shouldSend) {
        logger.info(`🔕 Skipped duplicate alert: ${type}`);
        return;
    }

    try {
        await sendEmail(type, payload);
        await insertAlert(type, hash, payload);
        logger.info(`📧 Alert sent and recorded: ${type}`);
    } catch (err) {
        logger.error(`❌ Failed to send or record alert (${type}): ${err.message}`);
    }
}

module.exports = {
    sendAndRecordEmail
};
