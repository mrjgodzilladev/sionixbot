const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro, safeReply } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao } = require('../../core/permissions');
const { confirmar } = require('../../core/confirm');
const { check } = require('../../core/cooldown');

module.exports = {
    categoria: 'Moderação', exemplo: '!nuke',
    data: new SlashCommandBuilder().setName('nuke').setDescription('Reseta o canal (apaga tudo)'),
    async execute({ client, interaction, message, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'nuke', 10000)) return;

        if (isSlash) await interaction.deferReply({ flags: 64 });

        if (!precisaPermissao(ctx, 'Administrator') || !precisaBotPermissao(ctx, 'ManageChannels')) return;

        if (!(await confirmar(ctx, 'Tem certeza que quer **NUKEAR** este canal? (Apaga tudo)'))) return;

        try {
            const canal = isSlash ? interaction.channel : message.channel;
            const pos = canal.position;
            const novo = await canal.clone();
            await novo.setPosition(pos);
            await canal.delete();
            novo.send({ embeds: [sucesso('💥 Canal nukado com sucesso!')] });
        } catch (err) {
            const embed = erro(`Erro ao nukar: \`${err.message}\``);
            await safeReply(ctx, { embeds: [embed] });
        }
    },
};