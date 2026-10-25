const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro, safeReply } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao, podePunir, resolverMembro } = require('../../core/permissions');
const { confirmar } = require('../../core/confirm');
const { logModeracao } = require('../../core/logs');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');

module.exports = {
    categoria: 'Moderação', exemplo: '!ban @fulano spam',
    data: new SlashCommandBuilder().setName('ban').setDescription('Bane um membro').addUserOption(o => o.setName('membro').setDescription('Quem?').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Por quê?').setRequired(false)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'ban', 3000)) return;

        if (isSlash) await interaction.deferReply({ flags: 64 });

        if (!precisaPermissao(ctx, 'BanMembers') || !precisaBotPermissao(ctx, 'BanMembers')) return;

        const alvo = isSlash ? await resolverMembro(ctx, interaction.options.getUser('membro').id) : await resolverMembro(ctx, args[0]);
        const motivo = isSlash ? (interaction.options.getString('motivo') || 'Não informado') : (args.slice(1).join(' ') || 'Não informado');
        if (!podePunir(ctx, alvo)) return;

        if (!(await confirmar(ctx, `Tem certeza que quer banir **${alvo.user.tag}**?\n**Motivo:** ${motivo}`))) return;

        try {
            await alvo.send({ embeds: [erro(`Você foi **banido** de **${alvo.guild.name}**.\n**Motivo:** ${motivo}`)] }).catch(() => {});
            await alvo.ban({ reason: `${motivo} | Por: ${isSlash ? interaction.user.tag : message.author.tag}` });

            const embed = sucesso(`**${alvo.user.tag}** foi banido com sucesso.\n**Motivo:** ${motivo}`);
            await safeReply(ctx, { embeds: [embed] });

            db.registrarAcao(alvo.guild.id, isSlash ? interaction.user.id : message.author.id, alvo.id, 'ban', motivo);
            await logModeracao(client, { acao: 'Ban', moderador: isSlash ? interaction.user : message.author, alvo: alvo.user, motivo });
        } catch (err) {
            const embed = erro(`Não consegui banir essa pessoa. O Discord deve estar me bloqueando. Detalhe: \`${err.message}\``);
            await safeReply(ctx, { embeds: [embed] });
        }
    },
};