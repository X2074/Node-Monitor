import { mainDb, getAllRecords } from './dbUtils';
import { buildQuery, buildCountQuery } from './queryBuilder';

interface FilterParams {
    [key: string]: any;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
}

/**
 * Creates a generic query function for a database table.
 * Supports pagination, filtering, and sorting.
 *
 * @param tableName - Name of the database table.
 * @param filterableFields - Fields that can be filtered.
 * @returns A query function.
 */
export function createQueryFunction<T = any>(
    tableName: string,
    filterableFields: string[] = []
): (filters: FilterParams) => Promise<{ data: T[]; total: number }> {
    return async function query(filters: FilterParams = {}): Promise<{ data: T[]; total: number }> {
        const allowedOrderFields = [...new Set([...filterableFields, 'created_at'])];

        const { sql, params } = buildQuery({
            tableName,
            filters,
            filterableFields,
            orderBy: filters.orderBy || 'created_at',
            order: filters.order === 'ASC' ? 'ASC' : 'DESC',
            limit: filters.limit || 20,
            offset: filters.offset || 0,
            allowedOrderFields,
        });

        const { sql: countSql, params: countParams } = buildCountQuery({
            tableName,
            filters,
            filterableFields,
        });

        try {
            const data = await getAllRecords<T>(mainDb, sql, params);
            const countResult = await getAllRecords<{ total: number }>(mainDb, countSql, countParams);
            const total = countResult?.[0]?.total || 0;
            return { data, total };
        } catch (err) {
            console.error(`Error querying ${tableName}:`, err);
            throw new Error(`Failed to query ${tableName} from database.`);
        }
    };
}
