import {createQueryRouter} from '../../utils/core/routeTemplate';
import {NodeMetaLog, queryNodeMeta} from '../../database/tables/nodeMetaLogger';
import {Request} from "express";

function parseMetaFilters(query: Request['query']): Record<string, any> {
    return {
        node_id: query.node_id,
        version: query.version,
        network: query.network,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: parseInt((query.limit as string) || '20', 10),
        offset: parseInt((query.offset as string) || '0', 10),
    };
}

export default createQueryRouter<NodeMetaLog>(queryNodeMeta, parseMetaFilters);
