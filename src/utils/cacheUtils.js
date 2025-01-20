class Cache {
    constructor() {
        this.store = {}; // 内存缓存
        this.timeouts = {}; // 记录每个键的过期时间
    }

    /**
     * 设置缓存
     * @param {string} key 缓存的键
     * @param {*} value 缓存的值
     * @param {number} [ttl] 过期时间（秒），可选
     */
    set(key, value, ttl) {
        this.store[key] = value;

        // 清理旧的过期时间
        if (this.timeouts[key]) {
            clearTimeout(this.timeouts[key]);
        }

        // 设置新的过期时间
        if (ttl && ttl > 0) {
            this.timeouts[key] = setTimeout(() => {
                this.delete(key);
            }, ttl * 1000);
        }
    }

    /**
     * 获取缓存
     * @param {string} key 缓存的键
     * @returns {*} 缓存的值，或 undefined 如果不存在
     */
    get(key) {
        return this.store[key];
    }

    /**
     * 删除缓存
     * @param {string} key 缓存的键
     */
    delete(key) {
        delete this.store[key];
        if (this.timeouts[key]) {
            clearTimeout(this.timeouts[key]);
            delete this.timeouts[key];
        }
    }

    /**
     * 清空所有缓存
     */
    clear() {
        this.store = {};
        Object.keys(this.timeouts).forEach((key) => clearTimeout(this.timeouts[key]));
        this.timeouts = {};
    }

    /**
     * 检查缓存是否存在
     * @param {string} key 缓存的键
     * @returns {boolean} 是否存在
     */
    has(key) {
        return key in this.store;
    }
}

// 导出单例
const cache = new Cache();
module.exports = cache;
