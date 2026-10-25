const { base } = require('./embed'); const config = require('./config');
module.exports = {
    enviarLog: async (client, embed) => {
        if (!config.logs?.enabled || !config.logs?.channelId) return;
        const c = await client.channels.fetch(config.logs.channelId).catch(()=>null);
        if (c?.isTextBased()) await c.send({ embeds: [embed] }).catch(()=>{});
    },
    logModeracao: async (client, { acao, moderador, alvo, motivo, extra }) => {
        const embed = base({ titulo: `Moderação: ${acao}`, tipo: 'aviso', campos: [
                { name: '👮 Moderador', value: `${moderador.tag}`, inline: false },
                { name: '🎯 Alvo', value: `${alvo.tag}`, inline: false },
                { name: '📝 Motivo', value: motivo || 'Não informado', inline: false },
                ...(extra ? [{ name: 'ℹ️ Extra', value: extra, inline: false }] : [])
            ]});
        module.exports.enviarLog(client, embed);
    }
};