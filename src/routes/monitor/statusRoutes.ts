import {Request} from 'express';
import {NodeStatusLog, queryNodeStatus} from '../../database/tables/nodeStatusLogger';
import {createQueryRouter} from '../../utils/core/routeTemplate';

function parseStatusFilters(query: Request['query']): Record<string, any> {
    return {
        node_id: query.node_id,
        minHeight: query.minHeight ? parseInt(query.minHeight as string, 10) : undefined,
        maxHeight: query.maxHeight ? parseInt(query.maxHeight as string, 10) : undefined,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: parseInt((query.limit as string) || '20', 10),
        offset: parseInt((query.offset as string) || '0', 10),
    };
}

export default createQueryRouter<NodeStatusLog>(queryNodeStatus, parseStatusFilters);
