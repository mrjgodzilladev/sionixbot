const { SlashCommandBuilder } = require('discord.js');
const { base } = require('../../core/embed');
const { precisaPermissao } = require('../../core/permissions');
const db = require('../../core/database');

module.exports = {
    categoria: 'Social',
    exemplo: '/statsmod',
    data: new SlashCommandBuilder().setName('statsmod').setDescription('Suas estatísticas de moderação (últimos 30 dias)'),
    async execute({ interaction, message, isSlash }) {
        const ctx = { interaction, message };
        if (!precisaPermissao(ctx, 'ModerateMembers')) return;

        const guild = isSlash ? interaction.guild : message.guild;
        const user = isSlash ? interaction.user : message.author;
        const desde = Date.now() - (30 * 86400000); // 30 dias

        const stats = db.getStatsModerador(guild.id, user.id, desde);
        if (stats.length === 0) return isSlash ? interaction.reply({ content: 'Você não fez nenhuma ação de moderação nos últimos 30 dias.', flags: 64 }) : message.reply('Nenhuma ação nos últimos 30 dias.');

        const campos = stats.map(s => ({ name: `🛡️ ${s.acao.toUpperCase()}`, value: `${s.total} vezes`, inline: true }));
        const embed = base({ titulo: `Estatísticas de ${user.username}`, descricao: 'Ações nos últimos 30 dias:', campos });

        return isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
    }
};