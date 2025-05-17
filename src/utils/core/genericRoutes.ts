import { Request, Response } from 'express';

type QueryFunction<T = any> = (filters: Record<string, any>) => Promise<{ data: T[]; total: number }>;
type FilterParser = (input: Record<string, any>) => Record<string, any>;

/**
 * Default query parser: parses pagination, order, and offset from query or body
 */
export function defaultParse(query: Record<string, any>): Record<string, any> {
    const limit = Math.min(parseInt(query.limit || '20'), 1000);
    const offset = parseInt(query.offset || '0');
    const orderBy = query.orderBy || 'created_at';
    const order = query.order === 'ASC' ? 'ASC' : 'DESC';

    return {
        ...query,
        orderBy,
        order,
        limit: isNaN(limit) ? 20 : limit,
        offset: isNaN(offset) ? 0 : offset,
    };
}

/**
 * Generic GET route handler
 */
export function createQueryRoute<T = any>(
    queryFunction: QueryFunction<T>,
    parseFilterFn: FilterParser = defaultParse
) {
    return async (req: Request, res: Response): Promise<void> => {
        try {
            const filters = parseFilterFn(req.query as Record<string, any>);
            const result = await queryFunction(filters);
            res.json({ success: true, ...result });
        } catch (err: any) {
            console.error('QueryRoute Error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    };
}

/**
 * Generic POST route handler
 */
export function createPostQueryRoute<T = any>(
    queryFunction: QueryFunction<T>,
    parseFilterFn: FilterParser = defaultParse
) {
    return async (req: Request, res: Response): Promise<void> => {
        try {
            const filters = parseFilterFn(req.body || {});
            const result = await queryFunction(filters);
            res.json({ success: true, ...result });
        } catch (err: any) {
            console.error('PostQueryRoute Error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    };
}
