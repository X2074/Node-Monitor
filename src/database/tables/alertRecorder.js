const crypto = require('crypto');
const {mainDb, initTable, insertRecord, getRecord} = require('../../utils/dbUtils');
const initTableSQL = `
    CREATE TABLE IF NOT EXISTS alerts
    (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        type       TEXT NOT NULL,
        hash       TEXT NOT NULL,
        payload    TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

initTable(mainDb, 'alerts', initTableSQL);

// Generate a unique content hash
function getContentHash(type, payload) {
    const raw = type + JSON.stringify(payload);
    return crypto.createHash('sha256').update(raw).digest('hex');
}

// Get the latest alert for a given type
function getLastAlert(type) {
    const querySQL = `
        SELECT *
        FROM alerts
        WHERE type = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;
    return getRecord(mainDb, querySQL, [type]);
}

// Insert a new alert record into the table
function insertAlert(type, hash, payload) {
    const insertSQL = `
        INSERT INTO alerts (type, hash, payload)
        VALUES (?, ?, ?)
    `;
    return insertRecord(mainDb, 'alerts', insertSQL, [type, hash, JSON.stringify(payload)]);
}

// Check if the alert should be sent (i.e., different from the last one)
async function shouldSendAlert(type, payload) {
    const currentHash = getContentHash(type, payload);
    const last = await getLastAlert(type);
    return !last || last.hash !== currentHash;
}

module.exports = {
    getContentHash,
    insertAlert,
    shouldSendAlert,
};
