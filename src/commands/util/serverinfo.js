const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { base } = require('../../core/embed');
const { check } = require('../../core/cooldown');

module.exports = {
    categoria: 'Util',
    exemplo: '!serverinfo',
    data: new SlashCommandBuilder().setName('serverinfo').setDescription('Informações do servidor'),
    async execute({ client, interaction, message, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'serverinfo', 3000)) return;
        const guild = isSlash ? interaction.guild : message.guild;

        const t = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const v = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const cats = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;

        const embed = base({ titulo: guild.name, thumbnail: guild.iconURL({ size: 256 }), campos: [
                { name: '👑 Dono', value: `<@${guild.ownerId}>`, inline: true },
                { name: '🆔 ID', value: `\`${guild.id}\``, inline: true },
                { name: '📅 Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '👥 Membros', value: `${guild.memberCount} (${guild.memberCount - bots} humanos + ${bots} bots)`, inline: false },
                { name: '💬 Canais', value: `${t} texto • ${v} voz • ${cats} categorias`, inline: false },
                { name: '🎭 Cargos', value: `${guild.roles.cache.size}`, inline: true },
                { name: '🚀 Boost', value: `Nível ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)`, inline: true }
            ]});
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};