const { queryMonitorLogs } = require('../../database/tables/monitorLogger');
const { createQueryRouter } = require('../../utils/core/routeTemplate');

function parseMonitorFilters(query) {
    return {
        status: query.status,
        type: query.type,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: parseInt(query.limit || '20'),
        offset: parseInt(query.offset || '0')
    };
}

module.exports = createQueryRouter(queryMonitorLogs, parseMonitorFilters);
