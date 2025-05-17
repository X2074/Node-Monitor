import {Request} from 'express';
import {AlertLog, queryAlerts} from '../../database/tables/alertLogger';
import {createQueryRouter} from '../../utils/core/routeTemplate';


function parseAlertFilters(query: Request['query']): Record<string, any> {
    return {
        type: query.type,
        hash: query.hash,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: parseInt((query.limit as string) || '20', 10),
        offset: parseInt((query.offset as string) || '0', 10),
    };
}

export default createQueryRouter<AlertLog>(queryAlerts, parseAlertFilters);
