const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro, aviso, safeReply } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao } = require('../../core/permissions');
const { confirmar } = require('../../core/confirm');
const { logModeracao } = require('../../core/logs');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');

module.exports = {
    categoria: 'Moderação', exemplo: '!clear 20',
    data: new SlashCommandBuilder().setName('clear').setDescription('Apaga mensagens').addIntegerOption(o => o.setName('quantidade').setDescription('1 a 100').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'clear', 5000)) return;

        if (isSlash) await interaction.deferReply({ flags: 64 });

        if (!precisaPermissao(ctx, 'ManageMessages') || !precisaBotPermissao(ctx, 'ManageMessages')) return;

        const qtd = isSlash ? interaction.options.getInteger('quantidade') : parseInt(args[0]);
        if (!qtd || qtd < 1 || qtd > 100) {
            const embed = aviso('Manda um número de **1 a 100**, por favor.');
            return safeReply(ctx, { embeds: [embed] });
        }

        if (!(await confirmar(ctx, `Apagar **${qtd}** mensagens desse canal? Não tem como desfazer!`))) return;

        try {
            const canal = isSlash ? interaction.channel : message.channel;
            const apagadas = await canal.bulkDelete(isSlash ? qtd : qtd + 1, true);

            const embed = sucesso(`Pronto! Apaguei **${apagadas.size}** mensagens e deixei o chat limpinho. 🧹`);
            await safeReply(ctx, { embeds: [embed] });

            db.registrarAcao(canal.guild.id, isSlash ? interaction.user.id : message.author.id, canal.id, 'clear', `Apagou ${apagadas.size} msgs`);
            await logModeracao(client, { acao: 'Clear', moderador: isSlash ? interaction.user : message.author, alvo: { tag: 'canal', id: canal.id }, motivo: `Apagou ${apagadas.size} mensagens` });
        } catch (err) {
            const embed = erro(`Não consegui apagar. Detalhe: \`${err.message}\``);
            await safeReply(ctx, { embeds: [embed] });
        }
    },
};