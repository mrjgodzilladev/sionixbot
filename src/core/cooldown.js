const cache = new Map();
module.exports = {
    check: (u, c, ms = 3000) => {
        const key = `${u}:${c}`; const now = Date.now();
        if (cache.has(key) && now < cache.get(key)) return false;
        cache.set(key, now + ms);
        if (cache.size > 5000) { for (const [k, v] of cache) if (v < now) cache.delete(k); }
        return true;
    }
};