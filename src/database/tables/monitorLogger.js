const {mainDb, initTable, insertRecord} = require('../../utils/dbUtils');

const initTableSQL = `
    CREATE TABLE IF NOT EXISTS monitor_logs
    (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        status     TEXT NOT NULL,
        type       TEXT NOT NULL,
        detail     TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

initTable(mainDb, 'monitor_log', initTableSQL);

function insertMonitorLog(status, type, payload) {
    const insertSQL = `
        INSERT INTO monitor_logs (status, type, detail)
        VALUES (?, ?, ?)
    `;
    return insertRecord(mainDb, 'monitor_logs', insertSQL, [status, type, JSON.stringify(payload)]);
}

module.exports = {
    insertMonitorLog,
};
