const { queryConnectionLogs } = require('../../database/tables/connectionLogger');
const { createQueryRouter } = require('../../utils/core/routeTemplate');

function parseConnectionFilters(query) {
    return {
        node_id: query.node_id,
        connections: query.connections ? parseInt(query.connections) : undefined,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: parseInt(query.limit || '20'),
        offset: parseInt(query.offset || '0')
    };
}

module.exports = createQueryRouter(queryConnectionLogs, parseConnectionFilters);
