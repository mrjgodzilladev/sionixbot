const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { base, erro } = require('../../core/embed');
const config = require('../../core/config');
const db = require('../../core/database');
const log = require('../../core/logger');

function tempoParaMs(t) {
    const m = t.match(/^(\d+)(s|m|h|d)$/i); if (!m) return null;
    return parseInt(m[1]) * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2].toLowerCase()];
}

async function encerrarSorteio(client, gw) {
    const canal = await client.channels.fetch(gw.channel_id).catch(() => null); if (!canal) return;
    const msg = await canal.messages.fetch(gw.message_id).catch(() => null); if (!msg) return;
    const inscritos = db.getEntries(gw.id);
    db.endGiveaway(gw.id);
    if (inscritos.length === 0) return msg.edit({ embeds: [base({ titulo: `Sorteio: ${gw.prize}`, descricao: '❌ Ninguém participou.', tipo: 'erro' })], components: [] }).catch(() => {});
    const sorteados = []; const pool = [...inscritos];
    for (let i = 0; i < Math.min(gw.winners, pool.length); i++) {
        const idx = Math.floor(Math.random() * pool.length);
        sorteados.push(`<@${pool[idx].user_id}>`); pool.splice(idx, 1);
    }
    await msg.edit({ embeds: [base({ titulo: `Sorteio: ${gw.prize}`, descricao: `🏆 **Vencedor(es):** ${sorteados.join(', ')}`, tipo: 'ok' })], components: [] }).catch(() => {});
    await canal.send({ content: `🎉 Parabéns ${sorteados.join(', ')}! Vocês ganharam **${gw.prize}**!` });
}

function agendarSorteio(client, gw) {
    const tempoRestante = gw.ends_at - Date.now();
    if (tempoRestante <= 0) return encerrarSorteio(client, gw);

    // O segredo: agenda em blocos de 24h para não estourar o limite do Node.js
    const delay = Math.min(tempoRestante, 86400000);
    setTimeout(async () => {
        // Recarrega do banco para ver se o tempo já acabou de verdade
        const atualizado = db.getGiveawayByMessage(gw.message_id);
        if (atualizado && !atualizado.ended) agendarSorteio(client, atualizado);
    }, delay);
}

async function iniciarSorteios(client) {
    const ativos = db.getActiveGiveaways();
    ativos.forEach(gw => agendarSorteio(client, gw));
    if (ativos.length > 0) log.info(`${ativos.length} sorteio(s) recuperado(s).`);
}

module.exports = {
    encerrarSorteio,
    iniciarSorteios,
    comandoCriar: {
        categoria: 'Diversão', exemplo: '/giveaway criar',
        data: new SlashCommandBuilder().setName('giveaway').setDescription('Sistema de sorteio').setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
            .addSubcommand(sub => sub.setName('criar').setDescription('Cria um novo sorteio').addStringOption(o => o.setName('premio').setDescription('Prêmio').setRequired(true)).addStringOption(o => o.setName('tempo').setDescription('Ex: 1h, 30m, 7d').setRequired(true)).addIntegerOption(o => o.setName('vencedores').setDescription('Ganhadores').setRequired(true).setMinValue(1).setMaxValue(50))),
        async execute({ client, interaction }) {
            await interaction.deferReply({ flags: 64 }); // Adia o slash

            const premio = interaction.options.getString('premio');
            const tempoStr = interaction.options.getString('tempo');
            const vencedores = interaction.options.getInteger('vencedores');
            const ms = tempoParaMs(tempoStr);
            if (!ms) return interaction.editReply({ embeds: [erro('Tempo inválido. Use 1s, 30m, 1h ou 7d.')] });

            const finalizaEm = Date.now() + ms;
            const embed = base({ titulo: `Sorteio: ${premio}`, descricao: `Clique abaixo para participar!\n\n**Prêmio:** ${premio}\n**Vencedores:** ${vencedores}\n**Termina em:** <t:${Math.floor(finalizaEm / 1000)}:R>`, tipo: 'ok' });
            const botao = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('giveaway:participar').setLabel('Participar').setEmoji('🎉').setStyle(ButtonStyle.Primary));

            const msg = await interaction.channel.send({ embeds: [embed], components: [botao] });
            db.createGiveaway(interaction.guild.id, interaction.channel.id, msg.id, premio, vencedores, finalizaEm, interaction.user.id);

            // Agora agenda com a nova função segura
            agendarSorteio(client, { message_id: msg.id, ends_at: finalizaEm });
            await interaction.editReply({ content: '✅ Sorteio criado!' });
        },
    },
};