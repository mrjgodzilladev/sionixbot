const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao } = require('../../core/permissions');
const { check } = require('../../core/cooldown');
const log = require('../../core/logger');

module.exports = {
    categoria: 'Moderação',
    exemplo: '!slowmode 10',
    data: new SlashCommandBuilder().setName('slowmode').setDescription('Define o modo lento do canal').addIntegerOption(o => o.setName('segundos').setDescription('0 para desativar').setRequired(true).setMinValue(0).setMaxValue(21600)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'slowmode', 3000)) return;
        if (!precisaPermissao(ctx, 'ManageChannels') || !precisaBotPermissao(ctx, 'ManageChannels')) return;

        const seg = isSlash ? interaction.options.getInteger('segundos') : parseInt(args[0]);
        if (seg === undefined || seg < 0) {
            const embed = erro('Manda um número válido.');
            return isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
        }

        try {
            const canal = isSlash ? interaction.channel : message.channel;
            await canal.setRateLimitPerUser(seg);

            const embed = sucesso(seg === 0 ? 'Slowmode desativado.' : `Slowmode definido para **${seg} segundos**.`);
            isSlash ? await interaction.reply({ embeds: [embed] }) : await message.reply({ embeds: [embed] });
        } catch (err) {
            const embed = erro(`Erro: \`${err.message}\``);
            isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
        }
    },
};