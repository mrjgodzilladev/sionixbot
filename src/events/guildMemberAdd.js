const { base } = require('../core/embed');
const config = require('../core/config');
const log = require('../core/logger');

// Controle do Anti-Raid em memória
const joins = new Map(); // guildId -> [timestamps]
const lockdownAtivo = new Set(); // guildId -> boolean

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const guild = member.guild;
        const cfg = config; // Agora lê do cache, sem ler o arquivo JSON toda hora

        // 1. Anti-Raid
        if (cfg.antiraid?.enabled) {
            const agora = Date.now();
            const lista = joins.get(guild.id) || [];
            lista.push(agora);
            const recentes = lista.filter(t => agora - t < cfg.antiraid.joinsWindowSeconds * 1000);
            joins.set(guild.id, recentes);

            if (recentes.length >= cfg.antiraid.joinsLimit && !lockdownAtivo.has(guild.id)) {
                lockdownAtivo.add(guild.id); // Marca como trancado

                if (cfg.antiraid.autoLockdown) {
                    const canaisTexto = guild.channels.cache.filter(c => c.type === 0);
                    for (const canal of canaisTexto.values()) {
                        await canal.permissionOverwrites.edit(guild.id, { SendMessages: false }).catch(() => {});
                    }

                    const canalLog = cfg.logs?.enabled ? guild.channels.cache.get(cfg.logs.channelId) : null;
                    if (canalLog) {
                        canalLog.send({ embeds: [base({ titulo: '🚨 RAID DETECTADO', descricao: 'O servidor foi trancado automaticamente por segurança.\nUse `/unlock` para destrancar os canais quando a invasão passar.', tipo: 'erro' })] }).catch(() => {});
                    }
                    log.warn(`[ANTIRAID] Servidor ${guild.name} trancado.`);
                }
            }
        }

        // 2. Autorole
        if (cfg.autorole) {
            if (member.user.bot && cfg.autorole.bots) member.roles.add(cfg.autorole.bots).catch(() => {});
            if (!member.user.bot && cfg.autorole.humans) member.roles.add(cfg.autorole.humans).catch(() => {});
            if (cfg.autorole.tempRole && cfg.autorole.tempRoleMinutes > 0) {
                member.roles.add(cfg.autorole.tempRole).catch(() => {});
                setTimeout(() => member.roles.remove(cfg.autorole.tempRole).catch(() => {}), cfg.autorole.tempRoleMinutes * 60000);
            }
        }

        // 3. Boas-vindas
        if (cfg.welcome?.enabled && cfg.welcome.channelId) {
            const canal = guild.channels.cache.get(cfg.welcome.channelId);
            if (canal) {
                const msg = cfg.welcome.message.replace('{user}', member).replace('{username}', member.user.username).replace('{server}', guild.name).replace('{memberCount}', guild.memberCount);
                canal.send({ embeds: [base({ titulo: 'Bem-vindo(a)!', descricao: msg, thumbnail: member.user.displayAvatarURL() })] }).catch(() => {});
            }
            if (cfg.welcome.dm) {
                member.send({ embeds: [base({ titulo: `Bem-vindo ao ${guild.name}!`, descricao: 'Esperamos que você goste daqui. 🌀' })] }).catch(() => {});
            }
        }
    },
};