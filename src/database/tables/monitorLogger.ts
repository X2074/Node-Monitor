import {getRecord, initTable, insertRecord, mainDb} from '../../utils/db/dbUtils';
import {createQueryFunction} from '../../utils/db/queryServiceTemplate';

const TABLE_NAME = 'monitor_logs';

export interface MonitorLog {
    id: number;
    status: string;
    type: string;
    detail: string;
    created_at: string;
}

const initTableSQL = `
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
    (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        status     TEXT NOT NULL,
        type       TEXT NOT NULL,
        detail     TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

initTable(mainDb, TABLE_NAME, initTableSQL);

export const queryMonitorLogs =
    createQueryFunction<MonitorLog>(TABLE_NAME, ['status', 'type']);

export function insertMonitorLog(
    status: string,
    type: string,
    payload: Record<string, any>
): Promise<number> {
    const insertSQL = `
        INSERT INTO ${TABLE_NAME} (status, type, detail)
        VALUES (?, ?, ?)
    `;
    return insertRecord(mainDb, TABLE_NAME, insertSQL, [status, type, JSON.stringify(payload)]);
}

export async function getMonitorLogsByStatus(status?: string): Promise<MonitorLog | null> {
    let sql = `
        SELECT *
        FROM ${TABLE_NAME}
        WHERE 1 = 1
    `;
    const params: unknown[] = [];

    if (status) {
        sql += ` AND status = ?`;
        params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT 1`;

    try {
        const result = await getRecord<MonitorLog>(mainDb, sql, params);
        return result ?? null;
    } catch (err) {
        console.error('Error fetching monitor logs from DB:', err);
        throw new Error('Failed to fetch monitor logs from database.');
    }
}
