const {createQueryRouter} = require("../../utils/core/routeTemplate");
const {queryMonitorLogs} = require("../../database/tables/monitorLogger");

function parseMetaFilters(query) {
    return {
        node_id: query.node_id,
        version: query.version ? parseInt(query.version, 10) : undefined,
        network: query.network,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        offset: query.offset ? parseInt(query.offset, 10) : 0
    };
}

module.exports = createQueryRouter(queryMonitorLogs, parseMetaFilters);

