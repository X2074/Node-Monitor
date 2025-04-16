const {mainDb, initTable, insertRecord} = require('../../utils/dbUtils');
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

module.exports = {
    insertNodeMeta
};
