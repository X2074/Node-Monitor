const express = require('express');
const {createQueryRoute, createPostQueryRoute} = require('./genericRoutes');

/**
 * Creates a generic query router for database querying endpoints.
 *
 * @param {Function} queryFunction - The function to execute the database query. Must return { data, total }.
 * @param {Function} [parseFilters] - Optional function to parse query parameters into filters.
 * @param {Object} [options] - Additional route configuration options.
 * @param {string[]} [options.paths] - Custom endpoint paths (defaults to ['/list']).
 * @param {boolean} [options.enablePost] - Whether to enable POST query route in addition to GET (default: false).
 * @param {Array<Function>} [options.middlewares] - Optional middleware functions to apply before route handlers.
 * @returns {import('express').Router} - Configured Express router.
 */
function createQueryRouter(queryFunction, parseFilters, options = {}) {
    const {
        paths = ['/list'],
        enablePost = false,
        middlewares = []
    } = options;

    const router = express.Router();

    for (const path of paths) {
        // Register GET route for query
        router.get(path, ...middlewares, createQueryRoute(queryFunction, parseFilters));

        // Optionally register POST route for query
        if (enablePost) {
            router.post(path, ...middlewares, createPostQueryRoute(queryFunction, parseFilters));
        }
    }

    return router;
}

module.exports = {createQueryRouter};
