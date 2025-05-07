const {queryAlerts} = require('../../database/tables/alertLogger');
const {createQueryRouter} = require('../../utils/core/routeTemplate');

function parseAlertFilters(query) {
    return {
        type: query.type,
        hash: query.hash,
        orderBy: query.orderBy,
        order: query.order === 'ASC' ? 'ASC' : 'DESC',
        limit: parseInt(query.limit || '20'),
        offset: parseInt(query.offset || '0')
    };
}

module.exports = createQueryRouter(queryAlerts, parseAlertFilters);
