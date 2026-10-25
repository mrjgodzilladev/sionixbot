const { SlashCommandBuilder } = require('discord.js'); const { base } = require('../../core/embed'); const { check } = require('../../core/cooldown');
module.exports = {
    categoria: 'Diversão', exemplo: '!sorte',
    data: new SlashCommandBuilder().setName('sorte').setDescription('Sorteia um membro online'),
    async execute({ interaction, message, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'sorte', 3000)) return;
        const guild = isSlash ? interaction.guild : message.guild;
        const membros = guild.members.cache.filter(m => m.presence?.status !== 'offline' && !m.user.bot).map(m => m);
        if (membros.length === 0) return;
        const sorteado = membros[Math.floor(Math.random() * membros.length)];
        const embed = base({ titulo: '🎲 Sorteio', descricao: `O escolhido da vez foi... **${sorteado.user.tag}**! 🎉`, thumbnail: sorteado.user.displayAvatarURL() });
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};