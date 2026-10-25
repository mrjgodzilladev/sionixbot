const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao } = require('../../core/permissions');
const { logModeracao } = require('../../core/logs');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');

module.exports = {
    categoria: 'Moderação',
    exemplo: '!unban 123456789',
    data: new SlashCommandBuilder().setName('unban').setDescription('Desbane um usuário pelo ID').addStringOption(o => o.setName('id').setDescription('ID do usuário').setRequired(true)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'unban', 3000)) return;
        if (!precisaPermissao(ctx, 'BanMembers') || !precisaBotPermissao(ctx, 'BanMembers')) return;

        const id = isSlash ? interaction.options.getString('id') : args[0];
        if (!/^\d+$/.test(id)) return isSlash ? interaction.reply({ content: 'ID inválido.', flags: 64 }) : message.reply('ID inválido.');

        try {
            const guild = isSlash ? interaction.guild : message.guild;
            const banido = await guild.bans.fetch(id).catch(() => null);
            if (!banido) {
                const embed = erro('Esse usuário não está banido.');
                return isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
            }

            await guild.members.unban(id, `Desbanido por ${isSlash ? interaction.user.tag : message.author.tag}`);

            const embed = sucesso(`**${banido.user.tag}** foi desbanido.`);
            isSlash ? await interaction.reply({ embeds: [embed] }) : await message.reply({ embeds: [embed] });

            db.registrarAcao(guild.id, isSlash ? interaction.user.id : message.author.id, id, 'unban', 'Desbanido');
            await logModeracao(client, { acao: 'Unban', moderador: isSlash ? interaction.user : message.author, alvo: banido.user, motivo: 'Desbanido' });
        } catch (err) {
            const embed = erro(`Erro ao desbanir: \`${err.message}\``);
            isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
        }
    },
};