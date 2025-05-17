import express, { Router, RequestHandler } from 'express';
import { createQueryRoute, createPostQueryRoute, defaultParse } from './genericRoutes';

type QueryFunction<T> = (filters: Record<string, any>) => Promise<{ data: T[]; total: number }>;
type ParseFilterFn = (input: Record<string, any>) => Record<string, any>;

interface QueryRouterOptions {
    paths?: string[];
    enablePost?: boolean;
    middlewares?: RequestHandler[];
}

/**
 * Creates a generic query router for database querying endpoints.
 */
export function createQueryRouter<T = any>(
    queryFunction: QueryFunction<T>,
    parseFilters: ParseFilterFn = defaultParse,
    options: QueryRouterOptions = {}
): Router {
    const {
        paths = ['/list'],
        enablePost = false,
        middlewares = []
    } = options;

    const router = express.Router();

    for (const path of paths) {
        router.get(path, ...middlewares, createQueryRoute(queryFunction, parseFilters));

        if (enablePost) {
            router.post(path, ...middlewares, createPostQueryRoute(queryFunction, parseFilters));
        }
    }

    return router;
}
