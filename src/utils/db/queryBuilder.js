const {applyAllFilters} = require('./sqlHelpers');

function buildQuery({
                        tableName,
                        filters = {},
                        filterableFields = [],
                        fuzzyFields = [],
                        rangeFields = {},
                        inFields = {},
                        orderBy = 'created_at',
                        order = 'DESC',
                        limit = 20,
                        offset = 0,
                        allowedOrderFields = ['created_at']
                    }) {
    let sql = `SELECT *
               FROM ${tableName}
               WHERE 1 = 1`;
    let params = [];

    ({sql, params} = applyAllFilters(sql, params, filters, {
        filterableFields,
        fuzzyFields,
        rangeFields,
        inFields
    }));

    const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'created_at';
    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${safeOrderBy} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return {sql, params};
}

function buildCountQuery({
                             tableName,
                             filters = {},
                             filterableFields = [],
                             fuzzyFields = [],
                             rangeFields = {},
                             inFields = {}
                         }) {
    let sql = `SELECT COUNT(*) as total
               FROM ${tableName}
               WHERE 1 = 1`;
    let params = [];

    ({sql, params} = applyAllFilters(sql, params, filters, {
        filterableFields,
        fuzzyFields,
        rangeFields,
        inFields
    }));

    return {sql, params};
}

module.exports = {
    buildQuery,
    buildCountQuery
};
