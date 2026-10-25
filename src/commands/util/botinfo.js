const { SlashCommandBuilder, version } = require('discord.js');
const { base } = require('../../core/embed');
const { check } = require('../../core/cooldown');

module.exports = {
    categoria: 'Util',
    exemplo: '!botinfo',
    data: new SlashCommandBuilder().setName('botinfo').setDescription('Informações do bot'),
    async execute({ client, interaction, message, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'botinfo', 3000)) return;
        const embed = base({ titulo: 'Sobre mim', thumbnail: client.user.displayAvatarURL({ size: 256 }), campos: [
                { name: '🤖 Nome', value: client.user.tag, inline: true },
                { name: '📦 Versão', value: '1.0.0', inline: true },
                { name: '🏠 Servidores', value: `${client.guilds.cache.size}`, inline: true },
                { name: '💾 Memória', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true },
                { name: '📡 WebSocket', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                { name: '📚 discord.js', value: `v${version}`, inline: true }
            ]});
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};