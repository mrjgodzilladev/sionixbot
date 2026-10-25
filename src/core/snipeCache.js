const cache = new Map();
const MAX_ENTRIES = 500; // ETAPA 3: Limite máximo para não estourar RAM

module.exports = {
    add: (channelId, data) => {
        let lista = cache.get(channelId) || [];
        lista.unshift(data);
        if (lista.length > 5) lista.pop();
        cache.set(channelId, lista);

        // Se o mapa ficar muito grande, remove os mais antigos
        if (cache.size > MAX_ENTRIES) {
            const primeiraChave = cache.keys().next().value;
            cache.delete(primeiraChave);
        }
    },
    get: (channelId) => {
        const lista = cache.get(channelId);
        return lista && lista.length > 0 ? lista[0] : null;
    }
};

setInterval(() => {
    const agora = Date.now();
    for (const [canalId, lista] of cache.entries()) {
        if (lista.length === 0 || (agora - lista[0].data.getTime()) > 3600000) {
            cache.delete(canalId);
        }
    }
}, 3600000).unref();