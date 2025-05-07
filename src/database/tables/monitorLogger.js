const {mainDb, initTable, insertRecord, getRecord, getAllRecords} = require('../../utils/db/dbUtils');
const {createQueryFunction} = require('../../utils/db/queryServiceTemplate');

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
const queryMonitorLogs = createQueryFunction('monitor_logs', ['status', 'type']);

function insertMonitorLog(status, type, payload) {
    const insertSQL = `
        INSERT INTO monitor_logs (status, type, detail)
        VALUES (?, ?, ?)
    `;
    return insertRecord(mainDb, 'monitor_logs', insertSQL, [status, type, JSON.stringify(payload)]);
}

async function getMonitorLogsByStatus(status) {
    let sql = `SELECT *
               FROM monitor_logs
               WHERE 1 = 1`;

    const params = [];

    if (status) {
        sql += ` AND status = ?`;
        params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT 1`;

    try {
        return await getRecord(mainDb, sql, params);
    } catch (err) {
        console.error('Error fetching monitor logs from DB:', err);
        throw new Error('Failed to fetch monitor logs from database.');
    }
}

module.exports = {
    getMonitorLogsByStatus,
    queryMonitorLogs,
    insertMonitorLog,
};
