const {mainDb, initTable, insertRecord} = require('../../utils/dbUtils');
const initTableSQL = `
    CREATE TABLE IF NOT EXISTS connection_log
    (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id     TEXT,
        connections INTEGER NOT NULL,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;
initTable(mainDb, 'connection_log', initTableSQL);

function insertConnectionLog(nodeInfo) {
    const sql = `INSERT INTO connection_log (node_id, connections)
                 VALUES (?, ?)`;
    const params = [
        nodeInfo.ID || null,
        nodeInfo.connections || 0
    ];
    return insertRecord(mainDb, 'connection_log', sql, params);
}


module.exports = {insertConnectionLog};
