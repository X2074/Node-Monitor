import {getCount, getRecord, initTable, insertRecord, mainDb} from '../../utils/db/dbUtils';
import {createQueryFunction} from '../../utils/db/queryServiceTemplate';

const TABLE_NAME = 'node_meta_log';

export interface NodeMetaLog {
    id: number;
    node_id: string;
    buildversion: string;
    version: number;
    protocolversion: number;
    network: string;
    created_at: string;
}

export interface InsertNodeMetaInput {
    node_id: string;
    buildversion: string;
    version: number;
    protocolversion: number;
    network: string;
}

const initTableSQL = `
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
    (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id         TEXT,
        buildversion    TEXT,
        version         INTEGER,
        protocolversion INTEGER,
        network         TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

initTable(mainDb, TABLE_NAME, initTableSQL);

export async function insertNodeMeta(info: InsertNodeMetaInput): Promise<number> {
    const checkSql = `
        SELECT COUNT(*) as count
        FROM ${TABLE_NAME}
        WHERE buildversion = ?
          AND version = ?
    `;
    const count = await getCount(mainDb, checkSql, [info.buildversion, info.version]);
    if (count > 0) return 0;

    const insertSql = `
        INSERT INTO ${TABLE_NAME} (node_id, buildversion, version, protocolversion, network)
        VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
        info.node_id,
        info.buildversion,
        info.version,
        info.protocolversion,
        info.network,
    ];

    return insertRecord(mainDb, TABLE_NAME, insertSql, params);
}

export async function getNodeMeta(): Promise<NodeMetaLog | null> {
    const sql = `
        SELECT *
        FROM ${TABLE_NAME}
        ORDER BY created_at DESC
        LIMIT 1
    `;
    try {
        const result = await getRecord<NodeMetaLog>(mainDb, sql, []);
        return result ?? null;
    } catch (err) {
        console.error('Error fetching node meta from DB:', err);
        throw new Error('Failed to fetch node meta from database.');
    }
}

export const queryNodeMeta = createQueryFunction<NodeMetaLog>(
    TABLE_NAME,
    ['node_id', 'version', 'network']
);
