import {Request} from 'express';
import {MonitorLog, queryMonitorLogs} from '../../database/tables/monitorLogger';
import {createQueryRouter} from '../../utils/core/routeTemplate';


function parseMonitorFilters(query: Request['query']): Record<string, any> {
    return {
        status: query.status,
        type: query.type,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: parseInt((query.limit as string) || '20', 10),
        offset: parseInt((query.offset as string) || '0', 10),
    };
}

export default createQueryRouter<MonitorLog>(queryMonitorLogs, parseMonitorFilters);
