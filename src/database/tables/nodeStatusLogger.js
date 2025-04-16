const {mainDb, initTable, insertRecord} = require('../../utils/dbUtils');
const initTableSQL = `
    CREATE TABLE IF NOT EXISTS node_status_log
    (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id      TEXT,
        mainorder    INTEGER,
        mainheight   INTEGER,
        pow_diff     REAL,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;
initTable(mainDb, 'node_status_log', initTableSQL);

function insertNodeStatusLog(info) {
    const sql = `
        INSERT INTO node_status_log (
            node_id, mainorder, mainheight, pow_diff
        ) VALUES (?, ?, ?, ?)
    `;
    const params = [
        info.ID,
        info.graphstate?.mainorder || null,
        info.graphstate?.mainheight || null,
        info.pow_diff?.current_diff || null
    ];
    return insertRecord(mainDb, 'node_status_log', sql, params);
}

module.exports = {
    insertNodeStatusLog
};
