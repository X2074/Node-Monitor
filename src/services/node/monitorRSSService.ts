import {getNodeStatus} from '../../database/tables/nodeStatusLogger';
import {getNodeMeta} from '../../database/tables/nodeMetaLogger';
import {getMonitorLogsByStatus} from '../../database/tables/monitorLogger';

interface NodeStatus {
    node_id: string;
    mainheight: number;
    pow_diff: number;
}

interface NodeMeta {
    buildversion: string;
    network: string;
}

interface MonitorLog {
    detail: string; // JSON string, expected to parse to { localHeight: number, chainHeight: number }
}

export async function generateRSS(): Promise<string> {
    const nodeStatusData: NodeStatus | null = await getNodeStatus();
    const nodeMetaData: NodeMeta | null = await getNodeMeta();
    const monitorData: MonitorLog | null = await getMonitorLogsByStatus("ok");

    if (!nodeStatusData || !nodeMetaData || !monitorData || !monitorData.detail) {
        throw new Error('Incomplete data from database.');
    }

    const {node_id, mainheight, pow_diff} = nodeStatusData;
    const {buildversion, network} = nodeMetaData;
    const {localHeight, chainHeight} = JSON.parse(monitorData.detail);

    const pubDate = new Date().toUTCString();

    const feedData = [
        {
            title: `Node ${node_id} Status: Stable`,
            link: `https://example.com/monitor/${node_id}`,
            description: `Node ${node_id} is Stable on ${network}. Version: ${buildversion}, Main Height: ${mainheight}, POW Diff: ${pow_diff}`,
        },
        {
            title: `Local Node Height: ${localHeight}`,
            link: `https://example.com/monitor/blockheight/${localHeight}`,
            description: `The local node is at block height ${localHeight}.`,
        },
        {
            title: `Chain Node Height: ${chainHeight}`,
            link: `https://example.com/monitor/chainheight/${chainHeight}`,
            description: `The node is synced with the chain at block height ${chainHeight}.`,
        },
        {
            title: `Node Sync Alert: No Issues`,
            link: `https://example.com/monitor/alerts`,
            description: `Node ${node_id} is operating normally.`,
        }
    ];

    const rssItems = feedData.map(item => `
    <item>
      <title>${item.title}</title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <guid isPermaLink="false">${item.link}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Node Health Monitoring</title>
            <link>https://example.com/monitor</link>
            <description>Real-time monitoring alerts for nodes</description>
            <language>en-us</language>
            <lastBuildDate>${pubDate}</lastBuildDate>
            ${rssItems}
          </channel>
        </rss>`;
}
