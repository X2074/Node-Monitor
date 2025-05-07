/**
 * Generic GET query handler for Express routes.
 *
 * @param {(filters: object) => Promise<{ data: any[], total: number }>} queryFunction
 *        The function that performs the query and returns data along with total count.
 * @param {(query: object) => object} [parseFilterFn=defaultParse]
 *        Optional parser to convert query string parameters into structured filter conditions.
 * @returns {(req: import('express').Request, res: import('express').Response) => Promise<void>}
 *          Express-compatible route handler.
 */
function createQueryRoute(queryFunction, parseFilterFn = defaultParse) {
    return async (req, res) => {
        try {
            const filters = parseFilterFn(req.query);
            const result = await queryFunction(filters);
            res.json({success: true, ...result}); // Returns data and total
        } catch (err) {
            console.error('QueryRoute Error:', err);
            res.status(500).json({success: false, message: err.message});
        }
    };
}

/**
 * Generic POST query handler (receives filters from request body).
 *
 * @param {(filters: object) => Promise<{ data: any[], total: number }>} queryFunction
 *        The function that executes the query.
 * @param {(body: object) => object} [parseFilterFn=defaultParse]
 *        Optional parser to convert request body into filter conditions.
 * @returns {(req: import('express').Request, res: import('express').Response) => Promise<void>}
 *          Express-compatible route handler.
 */
function createPostQueryRoute(queryFunction, parseFilterFn = defaultParse) {
    return async (req, res) => {
        try {
            const filters = parseFilterFn(req.body || {});
            const result = await queryFunction(filters);
            res.json({success: true, ...result});
        } catch (err) {
            console.error('PostQueryRoute Error:', err);
            res.status(500).json({success: false, message: err.message});
        }
    };
}

/**
 * Default query parameter parser.
 * Parses and sanitizes pagination and sorting fields.
 *
 * @param {object} query - Raw query object from Express (e.g. req.query or req. Body).
 * @returns {object} - Parsed filter object with limit, offset, order, and orderBy.
 */
function defaultParse(query) {
    const limit = Math.min(parseInt(query.limit || '20'), 1000); // Max 1000 rows
    const offset = parseInt(query.offset || '0');
    const orderBy = query.orderBy || 'created_at';
    const order = query.order === 'ASC' ? 'ASC' : 'DESC';

    return {
        ...query,
        orderBy,
        order,
        limit: isNaN(limit) ? 20 : limit,
        offset: isNaN(offset) ? 0 : offset
    };
}

module.exports = {
    createQueryRoute,
    createPostQueryRoute
};
