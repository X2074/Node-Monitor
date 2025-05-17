import { mainDb, initTable, insertRecord } from '../../utils/db/dbUtils';
import { createQueryFunction } from '../../utils/db/queryServiceTemplate';

export interface ConnectionLog {
    id: number;
    node_id: string;
    connections: number;
    created_at: string;
}

export interface InsertConnectionLogInput {
    ID?: string;
    connections?: number;
}

const initTableSQL = `
  CREATE TABLE IF NOT EXISTS connection_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id     TEXT,
    connections INTEGER NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

initTable(mainDb, 'connection_log', initTableSQL);

export const queryConnectionLogs = createQueryFunction<ConnectionLog>('connection_log', [
    'node_id',
    'connections'
]);

export function insertConnectionLog(nodeInfo: InsertConnectionLogInput): Promise<number> {
    const sql = `
    INSERT INTO connection_log (node_id, connections)
    VALUES (?, ?)
  `;
    const params = [
        nodeInfo.ID || null,
        nodeInfo.connections || 0
    ];
    return insertRecord(mainDb, 'connection_log', sql, params);
}
