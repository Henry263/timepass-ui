// utils/cache-manager.js
// Simple caching mechanism for API data

class CacheManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    }

    /**
     * Set data in cache with optional TTL
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, data);
        this.cacheTimestamps.set(key, {
            timestamp: Date.now(),
            ttl: ttl
        });
        console.log(`✓ Cache set for: ${key}`);
    }

    /**
     * Get data from cache if not expired
     * @param {string} key - Cache key
     * @returns {*} Cached data or null if expired/not found
     */
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const cacheInfo = this.cacheTimestamps.get(key);
        const isExpired = Date.now() - cacheInfo.timestamp > cacheInfo.ttl;

        if (isExpired) {
            console.log(`⚠ Cache expired for: ${key}`);
            this.delete(key);
            return null;
        }

        console.log(`✓ Cache hit for: ${key}`);
        return this.cache.get(key);
    }

    /**
     * Check if key exists in cache and is not expired
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Delete specific cache entry
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
        console.log(`✗ Cache deleted for: ${key}`);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.cacheTimestamps.clear();
        console.log('✗ All cache cleared');
    }

    /**
     * Clear cache by pattern (e.g., 'profile-*')
     * @param {string} pattern - Pattern to match
     */
    clearByPattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.delete(key));
        console.log(`✗ Cleared ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
    }

    /**
     * Get cache statistics
     * @returns {object} Cache statistics
     */
    getStats() {
        const stats = {
            totalEntries: this.cache.size,
            entries: []
        };

        for (const [key, info] of this.cacheTimestamps.entries()) {
            const age = Date.now() - info.timestamp;
            const remaining = info.ttl - age;
            stats.entries.push({
                key,
                age: Math.round(age / 1000) + 's',
                remaining: Math.round(remaining / 1000) + 's',
                expired: remaining <= 0
            });
        }

        return stats;
    }

    /**
     * Print cache statistics to console
     */
    printStats() {
        const stats = this.getStats();
        console.log('📊 Cache Statistics:');
        console.log(`Total entries: ${stats.totalEntries}`);
        if (stats.entries.length > 0) {
            console.table(stats.entries);
        }
    }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export helper functions
export function clearAllPageCaches() {
    cacheManager.clearByPattern('.*-data');
    console.log('🔄 All page caches cleared');
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.cacheManager = cacheManager;
}