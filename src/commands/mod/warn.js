const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro, safeReply } = require('../../core/embed');
const { precisaPermissao, resolverMembro } = require('../../core/permissions');
const { logModeracao } = require('../../core/logs');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');
const config = require('../../core/config');

module.exports = {
    categoria: 'Moderação', exemplo: '!warn @fulano spam',
    data: new SlashCommandBuilder().setName('warn').setDescription('Dá um aviso').addUserOption(o => o.setName('membro').setDescription('Quem?').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Por quê?').setRequired(true)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'warn', 2000)) return;

        if (isSlash) await interaction.deferReply({ flags: 64 });

        if (!precisaPermissao(ctx, 'ModerateMembers')) return;

        const alvo = isSlash ? await resolverMembro(ctx, interaction.options.getUser('membro').id) : await resolverMembro(ctx, args[0]);
        const motivo = isSlash ? interaction.options.getString('motivo') : args.slice(1).join(' ');

        if (!alvo || !motivo) {
            const embed = erro('Faltou o membro ou o motivo.');
            return safeReply(ctx, { embeds: [embed] });
        }

        const guild = isSlash ? interaction.guild : message.guild;
        const mod = isSlash ? interaction.user : message.author;

        db.addWarn(guild.id, alvo.id, mod.id, motivo);
        const total = db.countWarns(guild.id, alvo.id);

        await alvo.send({ embeds: [erro(`Você recebeu um aviso em **${guild.name}**.\n**Motivo:** ${motivo}\n**Total:** ${total}`)] }).catch(() => {});

        const embed = sucesso(`**${alvo.user.tag}** levou aviso.\n**Motivo:** ${motivo}\n**Total:** ${total}`);
        await safeReply(ctx, { embeds: [embed] });

        db.registrarAcao(guild.id, mod.id, alvo.id, 'warn', motivo);
        await logModeracao(client, { acao: 'Warn', moderador: mod, alvo: alvo.user, motivo, extra: `Total: ${total}` });

        // Strikes Automáticos
        const strikes = config.strikes;
        if (total >= strikes.banAt) {
            await alvo.ban({ reason: 'Limite de avisos atingido' }).catch(() => {});
            guild.channels.cache.get(config.logs.channelId)?.send({ embeds: [erro(`**${alvo.user.tag}** foi banido automaticamente (${total} warns).`)] }).catch(() => {});
        } else if (total >= strikes.kickAt) {
            await alvo.kick('Limite de avisos atingido').catch(() => {});
        } else if (total >= strikes.muteAt) {
            await alvo.timeout(strikes.muteHours * 3600000, 'Limite de avisos atingido').catch(() => {});
        }
    },
};