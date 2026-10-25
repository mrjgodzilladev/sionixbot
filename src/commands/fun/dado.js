const { SlashCommandBuilder } = require('discord.js'); const { base } = require('../../core/embed'); const { check } = require('../../core/cooldown');
module.exports = {
    categoria: 'Diversão', exemplo: '!dado 20',
    data: new SlashCommandBuilder().setName('dado').setDescription('Joga um dado').addIntegerOption(o => o.setName('lados').setDescription('Lados (padrão 6)').setRequired(false)),
    async execute({ interaction, message, args, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'dado', 2000)) return;
        const lados = (isSlash ? interaction.options.getInteger('lados') : parseInt(args[0])) || 6;
        if (lados < 2 || lados > 1000) return;
        const res = Math.floor(Math.random() * lados) + 1;
        const embed = base({ titulo: `🎲 D${lados}`, descricao: `Você tirou **${res}**!` });
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};