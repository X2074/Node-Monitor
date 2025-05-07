const { mainDb, getAllRecords } = require('./dbUtils');
const { buildQuery, buildCountQuery } = require('./queryBuilder');

/**
 * Creates a generic query function for a database table.
 * Supports pagination, filtering, and sorting.
 *
 * @param {string} tableName - Name of the database table.
 * @param {string[]} filterableFields - Fields that can be filtered.
 * @returns {(filters: object) => Promise<{ data: object[], total: number }>} - A query function.
 */
function createQueryFunction(tableName, filterableFields = []) {
    return async function query(filters = {}) {
        const allowedOrderFields = [...new Set([...filterableFields, 'created_at'])];

        const { sql, params } = buildQuery({
            tableName,
            filters,
            filterableFields,
            orderBy: filters.orderBy || 'created_at',
            order: filters.order === 'ASC' ? 'ASC' : 'DESC',
            limit: filters.limit || 20,
            offset: filters.offset || 0,
            allowedOrderFields
        });

        const { sql: countSql, params: countParams } = buildCountQuery({
            tableName,
            filters,
            filterableFields
        });

        try {
            const data = await getAllRecords(mainDb, sql, params);
            const countResult = await getAllRecords(mainDb, countSql, countParams);
            const total = countResult?.[0]?.total || 0;
            return { data, total };
        } catch (err) {
            console.error(`Error querying ${tableName}:`, err);
            throw new Error(`Failed to query ${tableName} from database.`);
        }
    };
}

module.exports = { createQueryFunction };
