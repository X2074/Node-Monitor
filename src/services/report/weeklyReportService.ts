import {fetchWeeklyStats} from './reportDataFetcher';
import {insertWeeklyReport} from '../../database/tables/weeklyReport';
import {sendEmail} from '../mail/mailService';
import config from '../../config';

export async function generateAndSendWeeklyReport() {
    const stats = await fetchWeeklyStats();
    const replacements = formatWeeklyReportReplacements(stats);
    console.log(replacements);
    await insertWeeklyReport(
        JSON.stringify(replacements),
    );
    await sendEmail('weeklyReport', replacements);
}

function formatWeeklyReportReplacements(data: any): Record<string, string | number> {
    const {alerts, connections, blocks} = data;
    const date = new Date().toISOString().split('T')[0];

    const alertsText = alerts.length === 0
        ? '- No alert records'
        : alerts.map((a: any) =>
            `- ${a.type}: ${a.count} times, most recent: ${a.latest}`
        ).join('\n');

    const connText = connections.length === 0
        ? '- No connection records'
        : connections.map((c: any) =>
            `- ${config.SERVER_IP || c.node}: ${c.total} requests, ${c.failures} failures, avg. connections: ${parseFloat(c.avg_connections).toFixed(2)}`
        ).join('\n');

    return {
        date,
        alerts: alertsText,
        connections: connText,
        minHeight: blocks?.min_height || '-',
        maxHeight: blocks?.max_height || '-',
        growth: blocks?.max_height && blocks?.min_height
            ? blocks.max_height - blocks.min_height
            : 0
    };
}

