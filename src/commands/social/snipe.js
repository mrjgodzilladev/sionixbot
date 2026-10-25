const { SlashCommandBuilder } = require('discord.js');
const { base, erro } = require('../../core/embed');
const { precisaPermissao } = require('../../core/permissions');
const snipeCache = require('../../core/snipeCache');

module.exports = {
    categoria: 'Social',
    exemplo: '/snipe',
    data: new SlashCommandBuilder().setName('snipe').setDescription('Mostra a última mensagem apagada do canal'),
    async execute({ interaction, message, isSlash }) {
        const ctx = { interaction, message };
        if (!precisaPermissao(ctx, 'ManageMessages')) return;

        const canal = isSlash ? interaction.channel : message.channel;
        const snipe = snipeCache.get(canal.id);

        if (!snipe) {
            const embed = erro('Nenhuma mensagem apagada recentemente neste canal.');
            return isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
        }

        const embed = base({
            titulo: '🔍 Mensagem Apagada',
            descricao: snipe.conteudo || '*Sem texto*',
            campos: [{ name: '👤 Autor', value: snipe.autor.tag, inline: true }, { name: '⏰ Quando', value: `<t:${Math.floor(snipe.data.getTime() / 1000)}:R>`, inline: true }],
            thumbnail: snipe.autor.displayAvatarURL()
        });
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};