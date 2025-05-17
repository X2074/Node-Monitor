import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import logger from '../core/logger';

sqlite3.verbose();

type Database = sqlite3.Database;

const dbCache: Record<string, Database> = {}; // Cache for db instances

/**
 * Ensure the directory exists
 */
function ensureDirExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
    }
}

// === Default main database configuration ===
const DB_DIR = path.resolve(process.cwd(), 'data');
const DEFAULT_DB_NAME = 'alerts.db';
const DEFAULT_DB_PATH = path.join(DB_DIR, DEFAULT_DB_NAME);

ensureDirExists(DB_DIR);

const mainDb: Database = dbCache[DEFAULT_DB_NAME] || new sqlite3.Database(DEFAULT_DB_PATH, (err) => {
    if (err) {
        logger.error(`❌ Failed to connect to main DB: ${DEFAULT_DB_NAME}`, err);
    } else {
        logger.info(`✅ Connected to SQLite ${DEFAULT_DB_NAME}`);
    }
});
dbCache[DEFAULT_DB_NAME] = mainDb;

/**
 * Used to create a connection to other databases
 */
export function createDatabaseConnection(dbName: string): Database {
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
 * Initialize table
 */
export function initTable(db: Database, tableName: string, createTableSQL: string): void {
    db.run(createTableSQL, (err) => {
        if (err) {
            logger.error(`❌ Failed to create ${tableName} table:`, err);
        } else {
            logger.info(`✅ Initialized table ${tableName}`);
        }
    });
}

/**
 * Insert record
 */
export function insertRecord(
    db: Database,
    tableName: string,
    insertSQL: string,
    params: any[]
): Promise<number> {
    return new Promise((resolve, reject) => {
        db.run(insertSQL, params, function (this: sqlite3.RunResult, err) {
            if (err) {
                logger.error(`❌ Failed to insert into ${tableName}:`, err);
                return reject(err);
            }
            resolve(this.lastID);
        });
    });
}

/**
 * Get one record
 */
export function getRecord<T = any>(
    db: Database,
    querySQL: string,
    params: any[]
): Promise<T | null> {
    return new Promise((resolve, reject) => {
        db.get(querySQL, params, (err: Error | null, row: T | undefined) => {
            if (err) {
                logger.error('❌ Failed to get record:', err);
                return reject(err);
            }
            resolve(row ?? null);
        });
    });
}

export async function getCount(
    db: Database,
    sql: string,
    params: any[]
): Promise<number> {
    const row = await getRecord<{ count: number }>(db, sql, params);
    return row?.count || 0;
}


/**
 * Get all records
 */
export function getAllRecords<T = any>(
    db: Database,
    querySQL: string,
    params: any[]
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        db.all(querySQL, params, (err: Error | null, rows: T[] | undefined) => {
            if (err) {
                logger.error('❌ Failed to get records:', err);
                return reject(err);
            }
            resolve(rows ?? []);
        });
    });
}


export {mainDb};
