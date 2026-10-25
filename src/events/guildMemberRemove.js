const { base } = require('../core/embed');
const config = require('../core/config');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const cfg = JSON.parse(require('fs').readFileSync(config.CONFIG_PATH, 'utf8'));
        if (!cfg.goodbye?.enabled || !cfg.goodbye.channelId) return;

        const canal = member.guild.channels.cache.get(cfg.goodbye.channelId);
        if (!canal) return;

        const msg = cfg.goodbye.message.replace('{username}', member.user.username).replace('{server}', member.guild.name);
        canal.send({ embeds: [base({ titulo: 'Até logo...', descricao: msg, tipo: 'aviso', thumbnail: member.user.displayAvatarURL() })] }).catch(() => {});
    },
};