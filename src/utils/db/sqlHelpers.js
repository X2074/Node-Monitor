/**
 * Apply multiple filter types to SQL in sequence.
 * @param {string} sql - Initial SQL string
 * @param {any[]} params - SQL parameters
 * @param {object} filters - Filter values
 * @param {object} options - Fields grouped by type
 * @returns {{ sql: string, params: any[] }}
 */
function applyAllFilters(sql, params, filters, options = {}) {
    const {
        filterableFields = [],
        fuzzyFields = [],
        rangeFields = {},
        inFields = {}
    } = options;

    // Exact match
    for (const field of filterableFields) {
        const value = filters[field];
        if (value !== undefined && value !== null && value !== '') {
            sql += ` AND ${field} = ?`;
            params.push(value);
        }
    }

    // LIKE fuzzy match
    for (const field of fuzzyFields) {
        const value = filters[field];
        if (typeof value === 'string' && value.trim() !== '') {
            sql += ` AND ${field} LIKE ?`;
            params.push(`%${value}%`);
        }
    }

    // BETWEEN range fields
    for (const [field, [start, end]] of Object.entries(rangeFields)) {
        if (start && end) {
            sql += ` AND ${field} BETWEEN ? AND ?`;
            params.push(start, end);
        }
    }

    // IN query
    for (const [field, values] of Object.entries(inFields)) {
        if (Array.isArray(values) && values.length > 0) {
            const placeholders = values.map(() => '?').join(', ');
            sql += ` AND ${field} IN (${placeholders})`;
            params.push(...values);
        }
    }

    return { sql, params };
}

module.exports = {
    applyAllFilters
};
