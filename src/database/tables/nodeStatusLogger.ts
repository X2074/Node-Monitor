import {getRecord, initTable, insertRecord, mainDb} from '../../utils/db/dbUtils';
import {createQueryFunction} from '../../utils/db/queryServiceTemplate';

export interface NodeStatusLog {
    id: number;
    node_id: string;
    mainorder: number;
    mainheight: number;
    pow_diff: number;
    created_at: string;
}

export interface NodeStatusInfoInput {
    ID: string;
    graphstate?: {
        mainorder?: number;
        mainheight?: number;
    };
    pow_diff?: {
        current_diff?: number;
    };
}

const initTableSQL = `
    CREATE TABLE IF NOT EXISTS node_status_log
    (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id    TEXT,
        mainorder  INTEGER,
        mainheight INTEGER,
        pow_diff   REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

initTable(mainDb, 'node_status_log', initTableSQL);

export const queryNodeStatus =
    createQueryFunction('node_status_log', [
        'node_id', 'mainheight', 'mainorder', 'pow_diff'
    ]);

export function insertNodeStatusLog(info: NodeStatusInfoInput): Promise<any> {
    const sql = `
        INSERT INTO node_status_log (node_id, mainorder, mainheight, pow_diff)
        VALUES (?, ?, ?, ?)
    `;
    const params = [
        info.ID,
        info.graphstate?.mainorder || null,
        info.graphstate?.mainheight || null,
        info.pow_diff?.current_diff || null
    ];
    return insertRecord(mainDb, 'node_status_log', sql, params);
}

export async function getNodeStatus(): Promise<NodeStatusLog | null> {
    const sql = `
        SELECT *
        FROM node_status_log
        ORDER BY created_at DESC
        LIMIT 1
    `;
    try {
        const result = await getRecord(mainDb, sql, []);
        return result || null;
    } catch (err) {
        console.error('Error fetching node status from DB:', err);
        throw new Error('Failed to fetch node status from database.');
    }
}
