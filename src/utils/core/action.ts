import { Response } from 'express';
import logger from './logger';
import { success, error } from './httpResponse';

export async function handleNodeAction(
    action: () => Promise<void>,
    successMessage: string,
    errorMessage: string,
    res: Response
): Promise<void> {
    try {
        await action();
        logger.info(successMessage);
        success(res, successMessage);
    } catch (err: any) {
        logger.error(`${errorMessage}: ${err.message}`);
        error(res, errorMessage);
    }
}
