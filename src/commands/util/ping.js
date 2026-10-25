const { SlashCommandBuilder } = require('discord.js');
const { base } = require('../../core/embed');
const { check } = require('../../core/cooldown');

module.exports = {
    categoria: 'Util',
    exemplo: '!ping ou /ping',
    data: new SlashCommandBuilder().setName('ping').setDescription('Mostra a latência do bot'),
    async execute({ client, interaction, message, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'ping', 2000)) return;
        const start = Date.now();
        const ws = Math.round(client.ws.ping);

        if (isSlash) {
            await interaction.deferReply();
            const rt = Date.now() - start;
            return interaction.editReply({ embeds: [base({ titulo: 'Pong! 🏓', campos: [
                        { name: '📡 WebSocket', value: `${ws}ms`, inline: true },
                        { name: '⏱️ Roundtrip', value: `${rt}ms`, inline: true }
                    ]})]});
        }

        const embed = base({ titulo: 'Pong! 🏓', campos: [
                { name: '📡 WebSocket', value: `${ws}ms`, inline: true },
                { name: '⏱️ Roundtrip', value: 'calculando...', inline: true }
            ]});
        const msg = await message.reply({ embeds: [embed] });
        embed.spliceFields(1, 1, { name: '⏱️ Roundtrip', value: `${Date.now() - start}ms`, inline: true });
        await msg.edit({ embeds: [embed] });
    }
};