const { base } = require('../core/embed');
const config = require('../core/config');
const snipeCache = require('../core/snipeCache');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        // 1. Salva no cache do Snipe (se a mensagem tiver conteúdo)
        if (message.content && !message.author?.bot) {
            snipeCache.add(message.channel.id, {
                autor: message.author,
                conteudo: message.content,
                data: new Date()
            });
        }

        // 2. Manda pro canal de logs
        if (!message.guild || message.author?.bot) return;
        if (!config.logs?.enabled || !config.logs.channelId) return;

        const canalLog = message.guild.channels.cache.get(config.logs.channelId);
        if (!canalLog) return;

        canalLog.send({
            embeds: [base({
                titulo: 'Mensagem Apagada',
                descricao: `**Autor:** ${message.author?.tag || 'Desconhecido'}\n**Canal:** ${message.channel}\n**Conteúdo:**\n${message.content?.slice(0, 1000) || '*Sem texto*'}`,
                tipo: 'aviso'
            })]
        }).catch(() => {});
    },
};