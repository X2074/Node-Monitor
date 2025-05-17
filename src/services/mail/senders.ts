import {sendEmail} from './mailService';
import {getContentHash, insertAlert, shouldSendAlert} from '../../database/tables/alertLogger';
import logger from '../../utils/core/logger';

interface AlertPayload {
    [key: string]: any; // You can replace this with a stricter structure if known
}

/**
 * Sends an email and logs the alert in the database if it's not a duplicate.
 */
export async function sendAndRecordEmail(type: string, payload: AlertPayload): Promise<void> {
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
        const error = err as Error;
        logger.error(`❌ Failed to send or record alert (${type}): ${error.message}`);
    }
}

