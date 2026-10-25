const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao } = require('../../core/permissions');
const { check } = require('../../core/cooldown');

module.exports = {
    categoria: 'Moderação',
    exemplo: '!lock',
    data: new SlashCommandBuilder().setName('lock').setDescription('Tranca o canal para o @everyone').addBooleanOption(o => o.setName('desativar').setDescription('Destrancar o canal?').setRequired(false)),
    async execute({ client, interaction, message, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'lock', 3000)) return;
        if (!precisaPermissao(ctx, 'ManageChannels') || !precisaBotPermissao(ctx, 'ManageChannels')) return;

        const destrancar = isSlash ? interaction.options.getBoolean('desativar') : false;
        const canal = isSlash ? interaction.channel : message.channel;

        try {
            await canal.permissionOverwrites.edit(canal.guild.id, { SendMessages: destrancar ? null : false });
            const embed = sucesso(destrancar ? 'Canal destrancado! 🔓' : 'Canal trancado! 🔒');
            isSlash ? await interaction.reply({ embeds: [embed] }) : await message.reply({ embeds: [embed] });
        } catch (err) {
            const embed = erro(`Erro: \`${err.message}\``);
            isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
        }
    },
};