import {applyAllFilters} from './sqlHelpers';

interface QueryOptions {
    tableName: string;
    filters?: Record<string, any>;
    filterableFields?: string[];
    fuzzyFields?: string[];
    rangeFields?: Record<string, [any, any]>;
    inFields?: Record<string, any[]>;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
    allowedOrderFields?: string[];
}

interface CountQueryOptions extends Omit<QueryOptions, 'orderBy' | 'order' | 'limit' | 'offset' | 'allowedOrderFields'> {
}

interface SQLResult {
    sql: string;
    params: any[];
}

export function buildQuery({
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
                               allowedOrderFields = ['created_at'],
                           }: QueryOptions): SQLResult {
    let sql = `SELECT *
               FROM ${tableName}
               WHERE 1 = 1`;
    let params: any[] = [];

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

export function buildCountQuery({
                                    tableName,
                                    filters = {},
                                    filterableFields = [],
                                    fuzzyFields = [],
                                    rangeFields = {},
                                    inFields = {},
                                }: CountQueryOptions): SQLResult {
    let sql = `SELECT COUNT(*) as total
               FROM ${tableName}
               WHERE 1 = 1`;
    let params: any[] = [];

    ({sql, params} = applyAllFilters(sql, params, filters, {
        filterableFields,
        fuzzyFields,
        rangeFields,
        inFields
    }));

    return {sql, params};
}
