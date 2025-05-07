const {mainDb, initTable, insertRecord, getRecord} = require('../../utils/db/dbUtils');
const {createQueryFunction} = require('../../utils/db/queryServiceTemplate');

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

const queryNodeStatus = createQueryFunction('node_status_log', [
    'node_id', 'mainheight', 'mainorder', 'pow_diff'
]);

function insertNodeStatusLog(info) {
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

async function getNodeStatus() {
    const sql = `SELECT *
                 FROM node_status_log
                 ORDER BY created_at DESC
                 LIMIT 1`;
    try {
        const result = await getRecord(mainDb, sql, []);
        if (!result) {
            return null;
        }
        return result;
    } catch (err) {
        console.error('Error fetching node status from DB:', err);
        throw new Error('Failed to fetch node status from database.');
    }
}


module.exports = {
    getNodeStatus,
    queryNodeStatus,
    insertNodeStatusLog
};
