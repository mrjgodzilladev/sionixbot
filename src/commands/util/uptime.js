const { SlashCommandBuilder } = require('discord.js');
const { base } = require('../../core/embed');
const { check } = require('../../core/cooldown');
const f = (ms) => { const s = Math.floor(ms / 1000); return `**${Math.floor(s / 86400)}**d **${Math.floor((s % 86400) / 3600)}**h **${Math.floor((s % 3600) / 60)}**m **${s % 60}**s`; };

module.exports = {
    categoria: 'Util',
    exemplo: '!uptime',
    data: new SlashCommandBuilder().setName('uptime').setDescription('Há quanto tempo estou online'),
    async execute({ client, interaction, message, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'uptime', 3000)) return;
        const embed = base({ titulo: 'Estou online há', descricao: f(client.uptime) });
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};