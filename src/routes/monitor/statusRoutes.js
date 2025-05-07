const {queryNodeStatus} = require('../../database/tables/nodeStatusLogger');
const {createQueryRouter} = require('../../utils/core/routeTemplate');

function parseStatusFilters(query) {
    return {
        node_id: query.node_id,
        minHeight: query.minHeight ? parseInt(query.minHeight) : undefined,
        maxHeight: query.maxHeight ? parseInt(query.maxHeight) : undefined,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: query.limit ? parseInt(query.limit) : 20,
        offset: query.offset ? parseInt(query.offset) : 0
    };
}

module.exports = createQueryRouter(queryNodeStatus, parseStatusFilters);
