const { SlashCommandBuilder } = require('discord.js');
const { sucesso, erro } = require('../../core/embed');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');
const scheduler = require('../../core/scheduler');

// Converte "1d2h30m" para milissegundos
function parseTempo(str) {
    const regex = /(\d+)(d|h|m|s)/g;
    let match, total = 0, encontrou = false;
    while ((match = regex.exec(str.toLowerCase())) !== null) {
        encontrou = true;
        const val = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'd') total += val * 86400000;
        if (unit === 'h') total += val * 3600000;
        if (unit === 'm') total += val * 60000;
        if (unit === 's') total += val * 1000;
    }
    return encontrou ? total : null;
}

module.exports = {
    categoria: 'Social',
    exemplo: '!lembrete 1h Beber água',
    data: new SlashCommandBuilder()
        .setName('lembrete')
        .setDescription('Cria um lembrete')
        .addStringOption(o => o.setName('tempo').setDescription('Ex: 10m, 1h, 1d').setRequired(true))
        .addStringOption(o => o.setName('mensagem').setDescription('O que devo lembrar?').setRequired(true)),

    async execute({ client, interaction, message, args, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'lembrete', 3000)) return;

        const tempoStr = isSlash ? interaction.options.getString('tempo') : args[0];
        const msg = isSlash ? interaction.options.getString('mensagem') : args.slice(1).join(' ');

        const ms = parseTempo(tempoStr);
        if (!ms || ms < 1000) return isSlash ? interaction.reply({ content: 'Tempo inválido. Use 10m, 1h, 1d.', flags: 64 }) : message.reply('Tempo inválido.');
        if (ms > 30 * 86400000) return isSlash ? interaction.reply({ content: 'O limite é 30 dias.', flags: 64 }) : message.reply('O limite é 30 dias.');
        if (!msg) return isSlash ? interaction.reply({ content: 'Falta a mensagem!', flags: 64 }) : message.reply('Falta a mensagem!');

        const guildId = isSlash ? interaction.guild.id : message.guild.id;
        const userId = isSlash ? interaction.user.id : message.author.id;
        const channelId = isSlash ? interaction.channel.id : message.channel.id;
        const expiresAt = Date.now() + ms;

        db.addReminder(userId, channelId, guildId, msg, expiresAt);

        // Pega o ID do último inserido para o scheduler
        const id = db.raw.prepare('SELECT last_insert_rowid() as id').get().id;
        scheduler.agendarLembrete(client, { id, user_id: userId, mensagem: msg, expires_at: expiresAt });

        const embed = sucesso(`Lembrete agendado para <t:${Math.floor(expiresAt / 1000)}:f> (<t:${Math.floor(expiresAt / 1000)}:R>).\nEu vou te mandar uma DM!`);
        return isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
    }
};