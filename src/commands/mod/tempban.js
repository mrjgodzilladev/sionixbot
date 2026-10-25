const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro, safeReply } = require('../../core/embed');
const { precisaPermissao, precisaBotPermissao, podePunir, resolverMembro } = require('../../core/permissions');
const { confirmar } = require('../../core/confirm');
const { logModeracao } = require('../../core/logs');
const { check } = require('../../core/cooldown');
const config = require('../../core/config');
const db = require('../../core/database');
const scheduler = require('../../core/scheduler');

module.exports = {
    categoria: 'Moderação', exemplo: '!tempban @fulano 7d spam',
    data: new SlashCommandBuilder().setName('tempban').setDescription('Bane por tempo limitado').addUserOption(o => o.setName('membro').setDescription('Quem?').setRequired(true)).addIntegerOption(o => o.setName('dias').setDescription('Dias (padrão: 7)').setRequired(false)).addStringOption(o => o.setName('motivo').setDescription('Por quê?').setRequired(false)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'tempban', 3000)) return;

        if (isSlash) await interaction.deferReply({ flags: 64 });

        if (!precisaPermissao(ctx, 'BanMembers') || !precisaBotPermissao(ctx, 'BanMembers')) return;

        const alvo = isSlash ? await resolverMembro(ctx, interaction.options.getUser('membro').id) : await resolverMembro(ctx, args[0]);
        let dias = isSlash ? interaction.options.getInteger('dias') : parseInt(args[1]);
        const motivo = isSlash ? (interaction.options.getString('motivo') || 'Não informado') : (args.slice(2).join(' ') || 'Não informado');

        if (!dias) dias = config.tempban.defaultDays;
        if (dias > config.tempban.maxDays) {
            const embed = erro(`Máximo de dias é ${config.tempban.maxDays}.`);
            return safeReply(ctx, { embeds: [embed] });
        }

        if (!podePunir(ctx, alvo)) return;

        if (!(await confirmar(ctx, `Tempban **${alvo.user.tag}** por **${dias} dias**?\n**Motivo:** ${motivo}`))) return;

        try {
            const unbanAt = Date.now() + dias * 86400000;
            await alvo.send({ embeds: [erro(`Você foi **banido** de **${alvo.guild.name}** por **${dias} dias**.\nMotivo: ${motivo}`)] }).catch(() => {});
            await alvo.ban({ reason: `Tempban: ${motivo}` });

            const result = db.addTempban(alvo.guild.id, alvo.id, isSlash ? interaction.user.id : message.author.id, motivo, unbanAt);
            scheduler.agendarTempban(client, { id: result.lastInsertRowid, guild_id: alvo.guild.id, user_id: alvo.id, unban_at: unbanAt });

            const embed = sucesso(`**${alvo.user.tag}** foi banido por **${dias} dias**.\n**Motivo:** ${motivo}`);
            await safeReply(ctx, { embeds: [embed] });
            db.registrarAcao(alvo.guild.id, isSlash ? interaction.user.id : message.author.id, alvo.id, 'tempban', motivo);
            await logModeracao(client, { acao: 'Tempban', moderador: isSlash ? interaction.user : message.author, alvo: alvo.user, motivo, extra: `${dias} dias` });
        } catch (err) {
            const embed = erro(`Erro no tempban: \`${err.message}\``);
            await safeReply(ctx, { embeds: [embed] });
        }
    },
};