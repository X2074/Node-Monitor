class Cache {
    constructor() {
        this.store = {}; 
        this.timeouts = {}; 
    }

  
    set(key, value, ttl) {
        this.store[key] = value;


        if (this.timeouts[key]) {
            clearTimeout(this.timeouts[key]);
        }


        if (ttl && ttl > 0) {
            this.timeouts[key] = setTimeout(() => {
                this.delete(key);
            }, ttl * 1000);
        }
    }

  
    get(key) {
        return this.store[key];
    }


    delete(key) {
        delete this.store[key];
        if (this.timeouts[key]) {
            clearTimeout(this.timeouts[key]);
            delete this.timeouts[key];
        }
    }

  
    clear() {
        this.store = {};
        Object.keys(this.timeouts).forEach((key) => clearTimeout(this.timeouts[key]));
        this.timeouts = {};
    }

    has(key) {
        return key in this.store;
    }
}

const cache = new Cache();
module.exports = cache;
