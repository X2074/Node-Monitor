import { mainDb, initTable, insertRecord, getRecord } from '../../utils/db/dbUtils';
import { createQueryFunction } from '../../utils/db/queryServiceTemplate';

export interface MonitorLog {
    id: number;
    status: string;
    type: string;
    detail: string;
    created_at: string;
}

const initTableSQL = `
    CREATE TABLE IF NOT EXISTS monitor_logs
    (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        status     TEXT NOT NULL,
        type       TEXT NOT NULL,
        detail     TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

initTable(mainDb, 'monitor_logs', initTableSQL);

export const queryMonitorLogs = createQueryFunction<MonitorLog>('monitor_logs', ['status', 'type']);

export function insertMonitorLog(
    status: string,
    type: string,
    payload: any
): Promise<number> {
    const insertSQL = `
    INSERT INTO monitor_logs (status, type, detail)
    VALUES (?, ?, ?)
  `;
    return insertRecord(mainDb, 'monitor_logs', insertSQL, [status, type, JSON.stringify(payload)]);
}

export async function getMonitorLogsByStatus(status?: string): Promise<MonitorLog | null> {
    let sql = `
    SELECT *
    FROM monitor_logs
    WHERE 1 = 1
  `;

    const params: any[] = [];

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
