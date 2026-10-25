const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro, safeReply } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao, podePunir, resolverMembro } = require('../../core/permissions');
const { confirmar } = require('../../core/confirm');
const { logModeracao } = require('../../core/logs');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');

module.exports = {
    categoria: 'Moderação', exemplo: '!softban @fulano spam',
    data: new SlashCommandBuilder().setName('softban').setDescription('Bane e desbane (limpa msgs)').addUserOption(o => o.setName('membro').setDescription('Quem?').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Por quê?').setRequired(false)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'softban', 3000)) return;

        if (isSlash) await interaction.deferReply({ flags: 64 });

        if (!precisaPermissao(ctx, 'BanMembers') || !precisaBotPermissao(ctx, 'BanMembers')) return;

        const alvo = isSlash ? await resolverMembro(ctx, interaction.options.getUser('membro').id) : await resolverMembro(ctx, args[0]);
        const motivo = isSlash ? (interaction.options.getString('motivo') || 'Não informado') : (args.slice(1).join(' ') || 'Não informado');
        if (!podePunir(ctx, alvo)) return;

        if (!(await confirmar(ctx, `Softban **${alvo.user.tag}**?\n**Motivo:** ${motivo}`))) return;

        try {
            await alvo.send({ embeds: [erro(`Você levou um **softban** em **${alvo.guild.name}**.\nMotivo: ${motivo}`)] }).catch(() => {});
            await alvo.ban({ reason: `Softban: ${motivo}`, deleteMessageSeconds: 604800 });
            await alvo.guild.members.unban(alvo.id, 'Softban concluído');
            const embed = sucesso(`**${alvo.user.tag}** levou softban.\n**Motivo:** ${motivo}`);
            await safeReply(ctx, { embeds: [embed] });
            db.registrarAcao(alvo.guild.id, isSlash ? interaction.user.id : message.author.id, alvo.id, 'softban', motivo);
            await logModeracao(client, { acao: 'Softban', moderador: isSlash ? interaction.user : message.author, alvo: alvo.user, motivo });
        } catch (err) {
            const embed = erro(`Erro no softban: \`${err.message}\``);
            await safeReply(ctx, { embeds: [embed] });
        }
    },
};