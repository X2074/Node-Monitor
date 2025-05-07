const {mainDb, initTable, insertRecord, getRecord} = require('../../utils/db/dbUtils');
const {createQueryFunction} = require('../../utils/db/queryServiceTemplate');

const initTableSQL = `
    CREATE TABLE IF NOT EXISTS node_meta_log
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
initTable(mainDb, 'node_meta_log', initTableSQL);

function insertNodeMeta(info) {
    const sql = `
        INSERT INTO node_meta_log (node_id, buildversion, version, protocolversion, network)
        VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
        info.ID,
        info.buildversion,
        info.version,
        info.protocolversion,
        info.network,
    ];
    return insertRecord(mainDb, 'node_meta_log', sql, params);
}

async function getNodeMeta() {
    const sql = `SELECT *
                 FROM node_meta_log
                 ORDER BY created_at DESC
                 LIMIT 1`;
    try {
        const result = await getRecord(mainDb, sql, []);
        if (!result) {
            return null;
        }
        return result;
    } catch (err) {
        console.error('Error fetching node meta from DB:', err);
        throw new Error('Failed to fetch node meta from database.');
    }
}


const queryNodeMeta = createQueryFunction('node_meta_log', ['node_id', 'version', 'network']);


module.exports = {
    getNodeMeta,
    insertNodeMeta,
    queryNodeMeta
};
