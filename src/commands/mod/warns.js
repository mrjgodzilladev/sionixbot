const { SlashCommandBuilder } = require('discord.js');
const { base, aviso } = require('../../core/embed');
const { resolverMembro } = require('../../core/permissions');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');

module.exports = {
    categoria: 'Moderação',
    exemplo: '!warns @fulano',
    data: new SlashCommandBuilder().setName('warns').setDescription('Ver avisos de um membro').addUserOption(o => o.setName('membro').setDescription('Quem?').setRequired(true)),
    async execute({ client, interaction, message, args, isSlash }) {
        const ctx = { client, interaction, message };
        if (!check(isSlash ? interaction.user.id : message.author.id, 'warns', 2000)) return;

        const alvo = isSlash ? await resolverMembro(ctx, interaction.options.getUser('membro').id) : await resolverMembro(ctx, args[0]);
        if (!alvo) {
            const embed = aviso('Membro não encontrado.');
            return isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
        }

        const guild = isSlash ? interaction.guild : message.guild;
        const warns = db.getWarns(guild.id, alvo.id);

        if (warns.length === 0) {
            const embed = base({ titulo: 'Nenhum aviso', descricao: `**${alvo.user.tag}** tá limpo! ✨`, tipo: 'ok' });
            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        }

        const lista = warns.slice(0, 10).map(w => `**#${w.id}** — <t:${Math.floor(w.created_at / 1000)}:d>\n> ${w.reason}\n> *por <@${w.moderator_id}>*`).join('\n\n');
        const embed = base({ titulo: `Avisos de ${alvo.user.username}`, descricao: lista + (warns.length > 10 ? `\n\n*...e mais ${warns.length - 10}*` : ''), rodape: `Total: ${warns.length}` });
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    },
};