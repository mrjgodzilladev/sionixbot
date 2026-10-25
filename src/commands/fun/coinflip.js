const { SlashCommandBuilder } = require('discord.js'); const { base } = require('../../core/embed'); const { check } = require('../../core/cooldown');
module.exports = {
    categoria: 'Diversão', exemplo: '!coinflip',
    data: new SlashCommandBuilder().setName('coinflip').setDescription('Joga uma moeda'),
    async execute({ interaction, message, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'coinflip', 2000)) return;
        const res = Math.random() < 0.5 ? '🪙 **Cara**' : '🪙 **Coroa**';
        const embed = base({ titulo: 'Jogando a moeda...', descricao: res });
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};