import crypto from 'crypto';
import {getRecord, initTable, insertRecord, mainDb} from '../../utils/db/dbUtils';
import {createQueryFunction} from '../../utils/db/queryServiceTemplate';

const TABLE_NAME = 'alerts';

export interface AlertLog {
    id: number;
    type: string;
    hash: string;
    payload: string;
    created_at: string;
}

const initTableSQL = `
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
    (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        type       TEXT NOT NULL,
        hash       TEXT NOT NULL,
        payload    TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

initTable(mainDb, TABLE_NAME, initTableSQL);

export const queryAlerts = createQueryFunction<AlertLog>(TABLE_NAME, ['type', 'hash']);

/**
 * Generate SHA256 hash of alert type + JSON payload
 */
const IGNORE_FIELDS = ['blockRate', 'heightHistory', 'timeDiff'];

export function getContentHash(type: string, payload: any): string {
    const filteredPayload = {...payload};

    for (const field of IGNORE_FIELDS) {
        delete filteredPayload[field];
    }

    const raw = type + JSON.stringify(filteredPayload);
    return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Get latest alert record of specific type
 */
export function getLastAlert(type: string): Promise<AlertLog | null> {
    const querySQL = `
        SELECT *
        FROM ${TABLE_NAME}
        WHERE type = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;
    return getRecord<AlertLog>(mainDb, querySQL, [type]);
}

/**
 * Insert new alert record
 */
export function insertAlert(type: string, hash: string, payload: any): Promise<number> {
    const insertSQL = `
        INSERT INTO ${TABLE_NAME} (type, hash, payload)
        VALUES (?, ?, ?)
    `;
    return insertRecord(mainDb, TABLE_NAME, insertSQL, [type, hash, JSON.stringify(payload)]);
}

/**
 * Check if alert is new by comparing content hash
 */
export async function shouldSendAlert(type: string, payload: any): Promise<boolean> {
    const currentHash = getContentHash(type, payload);
    const last = await getLastAlert(type);
    return !last || last.hash !== currentHash;
}
