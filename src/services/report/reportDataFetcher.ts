import {getAllRecords, mainDb} from '../../utils/db/dbUtils';

export async function fetchWeeklyStats() {
    const [alerts, connections, statuses, blocks] = await Promise.all([
        getAllRecords(mainDb, `
            SELECT type, COUNT(*) as count, MAX(created_at) as latest
            FROM alerts
            WHERE created_at >= datetime('now', '-7 day')
            GROUP BY type
        `, []),

        getAllRecords(mainDb, `
            SELECT node_id                                          as node,
                   COUNT(*)                                         as total,
                   SUM(CASE WHEN connections = 0 THEN 1 ELSE 0 END) as failures,
                   AVG(connections)                                 as avg_connections
            FROM connection_log
            WHERE created_at >= datetime('now', '-7 day')
            GROUP BY node_id
        `, []),

        getAllRecords(mainDb, `
            SELECT node_id    as node,
                   mainheight as status,
                   COUNT(*) as count
            FROM node_status_log
            WHERE created_at >= datetime('now', '-7 day')
            GROUP BY node_id, mainheight
        `, []),

        getAllRecords(mainDb, `
            SELECT MAX(mainheight) as max_height,
                   MIN(mainheight) as min_height
            FROM node_status_log
            WHERE created_at >= datetime('now', '-7 day')
        `, [])
    ]);

    return {
        alerts,
        connections,
        statuses,
        blocks: blocks[0] || {}
    };
}
