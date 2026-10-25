const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro, aviso, safeReply } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao, podePunir, resolverMembro } = require('../../core/permissions');
const { logModeracao } = require('../../core/logs');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');

module.exports = {
    categoria: 'Moderação', exemplo: '!timeout @fulano 10 spam',
    data: new SlashCommandBuilder().setName('timeout').setDescription('Silencia um membro').addUserOption(o => o.setName('membro').setDescription('Quem?').setRequired(true)).addIntegerOption(o => o.setName('minutos').setDescription('Minutos').setRequired(true).setMinValue(1).setMaxValue(40320)).addStringOption(o => o.setName('motivo').setDescription('Por quê?').setRequired(false)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'timeout', 3000)) return;

        if (isSlash) await interaction.deferReply({ flags: 64 });

        if (!precisaPermissao(ctx, 'ModerateMembers') || !precisaBotPermissao(ctx, 'ModerateMembers')) return;

        const alvo = isSlash ? await resolverMembro(ctx, interaction.options.getUser('membro').id) : await resolverMembro(ctx, args[0]);
        const minutos = isSlash ? interaction.options.getInteger('minutos') : parseInt(args[1]);
        const motivo = isSlash ? (interaction.options.getString('motivo') || 'Não informado') : (args.slice(2).join(' ') || 'Não informado');

        if (!alvo) return;
        if (!minutos || minutos < 1 || minutos > 40320) {
            const embed = aviso('Opa, o tempo deve ser de 1 a 40320 minutos (28 dias).');
            return safeReply(ctx, { embeds: [embed] });
        }
        if (!podePunir(ctx, alvo)) return;

        try {
            await alvo.timeout(minutos * 60000, `${motivo} | Por: ${isSlash ? interaction.user.tag : message.author.tag}`);
            const embed = sucesso(`**${alvo.user.tag}** tá de castigo por **${minutos} min**. Bora ver se aprende.\n**Motivo:** ${motivo}`);
            await safeReply(ctx, { embeds: [embed] });

            db.registrarAcao(alvo.guild.id, isSlash ? interaction.user.id : message.author.id, alvo.id, 'timeout', motivo);
            await logModeracao(client, { acao: 'Timeout', moderador: isSlash ? interaction.user : message.author, alvo: alvo.user, motivo, extra: `${minutos} min` });
        } catch (err) {
            const embed = erro(`Não consegui dar castigo. Detalhe: \`${err.message}\``);
            await safeReply(ctx, { embeds: [embed] });
        }
    },
};