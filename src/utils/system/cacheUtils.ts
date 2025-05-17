type CacheKey = string;
type TTL = number;

/**
 * A simple in-memory key-value cache with optional TTL (time to live).
 */
class Cache<T = any> {
    private store: Record<CacheKey, T>;
    private timeouts: Record<CacheKey, NodeJS.Timeout>;

    constructor() {
        this.store = {};
        this.timeouts = {};
    }

    /**
     * Stores a value in the cache under the given key, with optional TTL in seconds.
     * If TTL is specified, the key will automatically expire after that duration.
     */
    set(key: CacheKey, value: T, ttl?: TTL): void {
        this.store[key] = value;

        // Clear existing timeout if any
        if (this.timeouts[key]) {
            clearTimeout(this.timeouts[key]);
        }

        // Set expiration if TTL is defined and positive
        if (ttl && ttl > 0) {
            this.timeouts[key] = setTimeout(() => {
                this.delete(key);
            }, ttl * 1000);
        }
    }

    /**
     * Retrieves the value associated with the given key, or undefined if not found.
     */
    get(key: CacheKey): T | undefined {
        return this.store[key];
    }

    /**
     * Removes a key and its associated value from the cache.
     */
    delete(key: CacheKey): void {
        delete this.store[key];

        if (this.timeouts[key]) {
            clearTimeout(this.timeouts[key]);
            delete this.timeouts[key];
        }
    }

    /**
     * Clears the entire cache, including all timeouts.
     */
    clear(): void {
        this.store = {};

        Object.keys(this.timeouts).forEach(key => {
            clearTimeout(this.timeouts[key]);
        });

        this.timeouts = {};
    }

    /**
     * Checks whether a given key exists in the cache.
     */
    has(key: CacheKey): boolean {
        return key in this.store;
    }
}

const cache = new Cache();
export default cache;
