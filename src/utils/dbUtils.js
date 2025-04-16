const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const logger = require('./logger');

const dbCache = {}; // Used to cache all database connections (singleton)

/**
 * Ensure the directory exists
 */
function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// === Default main database configuration ===
const DB_DIR = path.resolve(process.cwd(), 'data');
const DEFAULT_DB_NAME = 'alerts.db';
const DEFAULT_DB_PATH = path.join(DB_DIR, DEFAULT_DB_NAME);

ensureDirExists(DB_DIR);

const mainDb = dbCache[DEFAULT_DB_NAME] || new sqlite3.Database(DEFAULT_DB_PATH, (err) => {
    if (err) {
        logger.error(`❌ Failed to connect to main DB: ${DEFAULT_DB_NAME}`, err);
    } else {
        logger.info(`✅ Connected to SQLite ${DEFAULT_DB_NAME}`);
    }
});
dbCache[DEFAULT_DB_NAME] = mainDb;

/**
 * Used to create a connection to other databases (e.g., multiple business databases)
 * Automatically reuses the connection for the same db file name
 */
function createDatabaseConnection(dbName) {
    if (dbCache[dbName]) return dbCache[dbName];

    const dbPath = path.join(DB_DIR, dbName);
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            logger.error(`❌ Failed to connect to SQLite DB: ${dbName}`, err);
        } else {
            logger.info(`✅ Connected to SQLite ${dbName}`);
        }
    });

    dbCache[dbName] = db;
    return db;
}

/**
 * Initialize the table structure
 * @param {Database} db
 * @param {string} tableName
 * @param {string} createTableSQL
 */
function initTable(db, tableName, createTableSQL) {
    db.run(createTableSQL, (err) => {
        if (err) {
            logger.error(`❌ Failed to create ${tableName} table:`, err);
        } else {
            logger.info(`✅ Initialized table ${tableName}`);
        }
    });
}

/**
 * Insert a record
 * @param {Database} db
 * @param {string} tableName
 * @param {string} insertSQL
 * @param {Array} params
 * @returns {Promise<number>}
 */
function insertRecord(db, tableName, insertSQL, params) {
    return new Promise((resolve, reject) => {
        db.run(insertSQL, params, function (err) {
            if (err) {
                logger.error(`❌ Failed to insert into ${tableName}:`, err);
                return reject(err);
            }
            resolve(this.lastID);
        });
    });
}

/**
 * Query a single record
 * @param {Database} db
 * @param {string} querySQL
 * @param {Array} params
 * @returns {Promise<object>}
 */
function getRecord(db, querySQL, params) {
    return new Promise((resolve, reject) => {
        db.get(querySQL, params, (err, row) => {
            if (err) {
                logger.error('❌ Failed to get record:', err);
                return reject(err);
            }
            resolve(row);
        });
    });
}

// ✅ Export utility functions + default main database
module.exports = {
    mainDb,
    createDatabaseConnection,
    initTable,
    insertRecord,
    getRecord,
};
