import {Request} from 'express';
import {ConnectionLog, queryConnectionLogs} from '../../database/tables/connectionLogger';
import {createQueryRouter} from '../../utils/core/routeTemplate';


function parseConnectionFilters(query: Request['query']): Record<string, any> {
    return {
        node_id: query.node_id,
        connections: query.connections ? parseInt(query.connections as string, 10) : undefined,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: parseInt((query.limit as string) || '20', 10),
        offset: parseInt((query.offset as string) || '0', 10),
    };
}

export default createQueryRouter<ConnectionLog>(queryConnectionLogs, parseConnectionFilters);
