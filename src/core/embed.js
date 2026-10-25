const { EmbedBuilder } = require('discord.js');
const config = require('./config');

const CORES = { ok: '#57F287', erro: '#ED4245', aviso: '#FEE75C', info: config.embedColor };

function base({ titulo, descricao, tipo = 'info', autor, campos, imagem, thumbnail, rodape, comData = true } = {}) {
    const e = new EmbedBuilder().setColor(CORES[tipo] || CORES.info).setFooter({ text: rodape || 'SionixBot 🌀' });
    if (titulo) e.setTitle(`${config.emoji} ${titulo}`);
    if (descricao) e.setDescription(descricao);
    if (autor) e.setAuthor(autor);
    if (campos) e.addFields(campos);
    if (imagem) e.setImage(imagem);
    if (thumbnail) e.setThumbnail(thumbnail);
    if (comData) e.setTimestamp();
    return e;
}

async function safeReply(ctx, payload) {
    if (ctx.interaction) {
        if (ctx.interaction.deferred || ctx.interaction.replied) {
            return ctx.interaction.editReply(payload).catch(() => {});
        }
        return ctx.interaction.reply({ ...payload, flags: 64 }).catch(() => {});
    }
    return ctx.message.reply(payload).catch(() => {});
}

module.exports = {
    base,
    // Títulos e tons mais amigáveis
    sucesso: (m, x={}) => base({ titulo: 'Boa! Tudo certo', descricao: m, tipo: 'ok', ...x }),
    erro: (m, x={}) => base({ titulo: 'Opa, deu ruim', descricao: m, tipo: 'erro', ...x }),
    aviso: (m, x={}) => base({ titulo: 'Calma aí', descricao: m, tipo: 'aviso', ...x }),
    info: (m, x={}) => base({ titulo: 'Na real', descricao: m, tipo: 'info', ...x }),
    safeReply
};