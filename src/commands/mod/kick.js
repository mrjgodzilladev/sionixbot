const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro, safeReply } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao, podePunir, resolverMembro } = require('../../core/permissions');
const { confirmar } = require('../../core/confirm');
const { logModeracao } = require('../../core/logs');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');

module.exports = {
    categoria: 'Moderação', exemplo: '!kick @fulano flood',
    data: new SlashCommandBuilder().setName('kick').setDescription('Expulsa um membro').addUserOption(o => o.setName('membro').setDescription('Quem?').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Por quê?').setRequired(false)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'kick', 3000)) return;

        if (isSlash) await interaction.deferReply({ flags: 64 });

        if (!precisaPermissao(ctx, 'KickMembers') || !precisaBotPermissao(ctx, 'KickMembers')) return;

        const alvo = isSlash ? await resolverMembro(ctx, interaction.options.getUser('membro').id) : await resolverMembro(ctx, args[0]);
        const motivo = isSlash ? (interaction.options.getString('motivo') || 'Não informado') : (args.slice(1).join(' ') || 'Não informado');
        if (!podePunir(ctx, alvo)) return;

        if (!(await confirmar(ctx, `Quer mesmo expulsar **${alvo.user.tag}**?\n**Motivo:** ${motivo}`))) return;

        try {
            await alvo.send({ embeds: [erro(`Você foi **expulso** de **${alvo.guild.name}**.\n**Motivo:** ${motivo}`)] }).catch(() => {});
            await alvo.kick(`${motivo} | Por: ${isSlash ? interaction.user.tag : message.author.tag}`);

            const embed = sucesso(`**${alvo.user.tag}** foi expulso. Ele pode voltar se tiver convite, hein!\n**Motivo:** ${motivo}`);
            await safeReply(ctx, { embeds: [embed] });

            db.registrarAcao(alvo.guild.id, isSlash ? interaction.user.id : message.author.id, alvo.id, 'kick', motivo);
            await logModeracao(client, { acao: 'Kick', moderador: isSlash ? interaction.user : message.author, alvo: alvo.user, motivo });
        } catch (err) {
            const embed = erro(`Não consegui expulsar. Verifique meu cargo e minhas permissões.\nDetalhe: \`${err.message}\``);
            await safeReply(ctx, { embeds: [embed] });
        }
    },
};