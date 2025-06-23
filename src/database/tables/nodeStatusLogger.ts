import { getRecord, initTable, insertRecord, mainDb } from '../../utils/db/dbUtils';
import { createQueryFunction } from '../../utils/db/queryServiceTemplate';

const TABLE_NAME = 'node_status_log';

export interface NodeStatusLog {
    id: number;
    node_id: string;
    mainorder: number;
    mainheight: number;
    pow_diff: number;
    created_at: string;
}

export interface NodeStatusInfoInput {
    node_id: string;
    graphstate?: {
        mainorder?: number;
        mainheight?: number;
    };
    pow_diff?: {
        current_diff?: number;
    };
}

const initTableSQL = `
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
    (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id    TEXT,
        mainorder  INTEGER,
        mainheight INTEGER,
        pow_diff   REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

initTable(mainDb, TABLE_NAME, initTableSQL);

export const queryNodeStatus = createQueryFunction<NodeStatusLog>(TABLE_NAME, [
    'node_id', 'mainheight', 'mainorder', 'pow_diff'
]);

export function insertNodeStatusLog(info: NodeStatusInfoInput): Promise<number> {
    const sql = `
        INSERT INTO ${TABLE_NAME} (node_id, mainorder, mainheight, pow_diff)
        VALUES (?, ?, ?, ?)
    `;
    const params = [
        info.node_id,
        info.graphstate?.mainorder ?? null,
        info.graphstate?.mainheight ?? null,
        info.pow_diff?.current_diff ?? null
    ];
    return insertRecord(mainDb, TABLE_NAME, sql, params);
}

export async function getNodeStatus(): Promise<NodeStatusLog | null> {
    const sql = `
        SELECT *
        FROM ${TABLE_NAME}
        ORDER BY created_at DESC
        LIMIT 1
    `;
    try {
        const result = await getRecord<NodeStatusLog>(mainDb, sql, []);
        return result ?? null;
    } catch (err) {
        console.error('Error fetching node status from DB:', err);
        throw new Error('Failed to fetch node status from database.');
    }
}
