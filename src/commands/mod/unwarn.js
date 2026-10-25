const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro } = require('../../core/embed');
const { precisaPermissao } = require('../../core/permissions');
const { logModeracao } = require('../../core/logs');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');

module.exports = {
    categoria: 'Moderação',
    exemplo: '!unwarn 12',
    data: new SlashCommandBuilder().setName('unwarn').setDescription('Remove um aviso pelo ID').addIntegerOption(o => o.setName('id').setDescription('ID do aviso').setRequired(true)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'unwarn', 2000)) return;
        if (!precisaPermissao(ctx, 'ModerateMembers')) return;

        const id = isSlash ? interaction.options.getInteger('id') : parseInt(args[0]);
        if (!id) {
            const embed = erro('Precisa do ID do aviso.');
            return isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
        }

        const guild = isSlash ? interaction.guild : message.guild;
        const res = db.removeWarn(id, guild.id);

        if (res.changes === 0) {
            const embed = erro(`Aviso #${id} não encontrado.`);
            return isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
        }

        const embed = sucesso(`Aviso #${id} removido.`);
        isSlash ? await interaction.reply({ embeds: [embed] }) : await message.reply({ embeds: [embed] });
        await logModeracao(client, { acao: 'Unwarn', moderador: isSlash ? interaction.user : message.author, alvo: { tag: 'removido', id: '-' }, motivo: `Removeu aviso #${id}` });
    },
};