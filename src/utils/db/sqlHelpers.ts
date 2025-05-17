interface FilterOptions {
    filterableFields?: string[];
    fuzzyFields?: string[];
    rangeFields?: Record<string, [any, any]>;  // e.g., { created_at: ['2024-01-01', '2024-01-31'] }
    inFields?: Record<string, any[]>;          // e.g., { status: ['ok', 'fail'] }
}

interface ApplyFilterResult {
    sql: string;
    params: any[];
}

/**
 * Apply multiple filter types to SQL in sequence.
 *
 * @param sql - Initial SQL string
 * @param params - SQL parameters
 * @param filters - Actual filter values passed from caller
 * @param options - Field groups to apply different types of filters
 * @returns Modified SQL and params
 */
export function applyAllFilters(
    sql: string,
    params: any[],
    filters: Record<string, any>,
    options: FilterOptions = {}
): ApplyFilterResult {
    const {
        filterableFields = [],
        fuzzyFields = [],
        rangeFields = {},
        inFields = {},
    } = options;

    // Exact match (=)
    for (const field of filterableFields) {
        const value = filters[field];
        if (value !== undefined && value !== null && value !== '') {
            sql += ` AND ${field} = ?`;
            params.push(value);
        }
    }

    // Fuzzy match (LIKE)
    for (const field of fuzzyFields) {
        const value = filters[field];
        if (typeof value === 'string' && value.trim() !== '') {
            sql += ` AND ${field} LIKE ?`;
            params.push(`%${value}%`);
        }
    }

    // Range match (BETWEEN)
    for (const [field, [start, end]] of Object.entries(rangeFields)) {
        if (start && end) {
            sql += ` AND ${field} BETWEEN ? AND ?`;
            params.push(start, end);
        }
    }

    // IN match
    for (const [field, values] of Object.entries(inFields)) {
        if (Array.isArray(values) && values.length > 0) {
            const placeholders = values.map(() => '?').join(', ');
            sql += ` AND ${field} IN (${placeholders})`;
            params.push(...values);
        }
    }

    return { sql, params };
}
