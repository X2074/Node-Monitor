import {getAllRecords, initTable, insertRecord, mainDb} from '../../utils/db/dbUtils';

const TABLE_NAME = 'weekly_report';

export interface WeeklyReportData {
    date: string;
    alerts: any[];
    connections: any[];
    blocks: any[];

    [key: string]: any;
}

export interface WeeklyReport {
    id: number;
    report: WeeklyReportData;
    report_date: string;
    created_at: string;
}

const CREATE_SQL = `
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
    (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        report      TEXT NOT NULL,
        report_date TEXT NOT NULL UNIQUE,
        created_at  TEXT DEFAULT (datetime('now'))
    );
`;

initTable(mainDb, TABLE_NAME, CREATE_SQL);

export function insertWeeklyReport(report: string): Promise<number> {
    const reportObj = JSON.parse(report);
    const reportDate = reportObj.date;

    return insertRecord(
        mainDb,
        TABLE_NAME,
        `INSERT INTO ${TABLE_NAME} (report, report_date, created_at)
         VALUES (?, ?, ?)`,
        [
            report,
            reportDate,
            new Date().toISOString()
        ]
    );
}

export async function getWeeklyReports(): Promise<WeeklyReport[]> {
    const rawRecords = await getAllRecords(
        mainDb,
        `SELECT *
         FROM ${TABLE_NAME}
         ORDER BY report_date DESC`,
        []
    );

    return rawRecords.map(r => ({
        ...r,
        report: JSON.parse(r.report)
    }));
}
