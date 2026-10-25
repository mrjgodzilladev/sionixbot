const { base } = require('../core/embed');
const config = require('../core/config');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (!newMessage.guild || newMessage.author?.bot || oldMessage.content === newMessage.content) return;
        if (!config.logs?.enabled || !config.logs.channelId) return;

        const canalLog = newMessage.guild.channels.cache.get(config.logs.channelId);
        if (!canalLog) return;

        canalLog.send({ embeds: [base({ titulo: 'Mensagem Editada', descricao: `**Autor:** ${newMessage.author.tag}\n**Canal:** ${newMessage.channel}\n\n**Antes:**\n${oldMessage.content?.slice(0, 500) || '*Vazio*'}\n\n**Depois:**\n${newMessage.content?.slice(0, 500) || '*Vazio*'}`, tipo: 'info' })] }).catch(() => {});
    },
};