const cache = new Map();
const MAX_ENTRIES = 5000; // ETAPA 3: Limite máximo

module.exports = {
    verificar: (membro, config) => {
        if (!config.trust?.enabled) return true;
        const idade = Date.now() - membro.user.createdTimestamp;
        if (idade < config.trust.minAccountAgeDays * 86400000) {
            const key = `${membro.guild.id}:${membro.id}`;
            const now = Date.now();
            let hist = cache.get(key) || [];
            hist = hist.filter(t => now - t < config.trust.windowSeconds * 1000);
            hist.push(now);
            cache.set(key, hist);

            // Se o mapa ficar muito grande, remove os mais antigos
            if (cache.size > MAX_ENTRIES) {
                const primeiraChave = cache.keys().next().value;
                cache.delete(primeiraChave);
            }

            if (hist.length > config.trust.messagesLimit) return false;
        }
        return true;
    }
};

setInterval(() => {
    const agora = Date.now();
    for (const [key, hist] of cache.entries()) {
        if (hist.length === 0 || (agora - hist[hist.length - 1]) > 3600000) {
            cache.delete(key);
        }
    }
}, 3600000).unref();