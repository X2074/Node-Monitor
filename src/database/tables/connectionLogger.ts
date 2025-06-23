import { mainDb, initTable, insertRecord } from '../../utils/db/dbUtils';
import { createQueryFunction } from '../../utils/db/queryServiceTemplate';

const TABLE_NAME = 'connection_log';

export interface ConnectionLog {
    id: number;
    node_id: string;
    connections: number;
    created_at: string;
}

export interface InsertConnectionLogInput {
    node_id?: string;
    connections?: number;
}

const initTableSQL = `
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
    (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id     TEXT,
        connections INTEGER NOT NULL,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

initTable(mainDb, TABLE_NAME, initTableSQL);

export const queryConnectionLogs = createQueryFunction<ConnectionLog>(TABLE_NAME, [
    'node_id',
    'connections'
]);

export function insertConnectionLog(nodeInfo: InsertConnectionLogInput): Promise<number> {
    const sql = `
        INSERT INTO ${TABLE_NAME} (node_id, connections)
        VALUES (?, ?)
    `;
    const params = [
        nodeInfo.node_id ?? null,
        nodeInfo.connections ?? 0
    ];
    return insertRecord(mainDb, TABLE_NAME, sql, params);
}
