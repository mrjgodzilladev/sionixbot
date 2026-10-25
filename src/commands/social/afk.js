const { SlashCommandBuilder } = require('discord.js');
const { base } = require('../../core/embed');
const db = require('../../core/database');

module.exports = {
    categoria: 'Social',
    exemplo: '!afk almoçando',
    data: new SlashCommandBuilder().setName('afk').setDescription('Define seu status como AFK').addStringOption(o => o.setName('motivo').setDescription('Por que você está ausente?').setRequired(false)),
    async execute({ interaction, message, args, isSlash }) {
        const motivo = isSlash ? (interaction.options.getString('motivo') || 'Sem motivo') : (args.join(' ') || 'Sem motivo');
        const guildId = isSlash ? interaction.guild.id : message.guild.id;
        const userId = isSlash ? interaction.user.id : message.author.id;

        db.setAfk(guildId, userId, motivo);

        const embed = base({ titulo: '💤 Modo AFK ativado', descricao: `Vou avisar se alguém te marcar.\n**Motivo:** ${motivo}`, tipo: 'info' });
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};