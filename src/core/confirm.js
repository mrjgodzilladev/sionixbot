const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { base, safeReply } = require('./embed');

module.exports = {
    confirmar: async (ctx, msg, id = 'conf') => {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`${id}:sim`).setLabel('Sim, pode fazer').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`${id}:nao`).setLabel('Não, cancela').setStyle(ButtonStyle.Secondary)
        );

        const payload = { embeds: [base({ titulo: 'Só confirmando...', descricao: msg, tipo: 'aviso' })], components: [row], fetchReply: true };

        // CORREÇÃO: O safeReply agora retorna a mensagem enviada, resolvendo o problema no modo prefixo.
        const m = await safeReply(ctx, payload);

        if (!m) return false;

        try {
            const autorId = ctx.interaction?.user.id || ctx.message.author.id;
            const i = await m.awaitMessageComponent({ filter: (i) => i.user.id === autorId, time: 30000 });
            const sim = i.customId.endsWith(':sim');
            await i.update({ components: [] }).catch(()=>{});
            return sim;
        } catch {
            await m.edit({ embeds: [base({ descricao: 'Deu tempo, a ação foi cancelada por segurança.', tipo: 'aviso' })], components: [] }).catch(()=>{});
            return false;
        }
    }
};