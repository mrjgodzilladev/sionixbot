const { SlashCommandBuilder } = require('discord.js'); const { base } = require('../../core/embed'); const { check } = require('../../core/cooldown');
const respostas = ['Com certeza!', 'Sem dúvidas.', 'Sim.', 'Provavelmente.', 'Pode contar com isso.', 'Pergunte mais tarde.', 'Não posso prever agora.', 'Não conte com isso.', 'Minha resposta é não.', 'Muito duvidoso.'];
module.exports = {
    categoria: 'Diversão', exemplo: '!8ball vou ficar rico?',
    data: new SlashCommandBuilder().setName('8ball').setDescription('Pergunte à bola mágica').addStringOption(o => o.setName('pergunta').setDescription('Sua pergunta').setRequired(true)),
    async execute({ interaction, message, args, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, '8ball', 2000)) return;
        const p = isSlash ? interaction.options.getString('pergunta') : args.join(' ');
        if (!p) return;
        const embed = base({ titulo: '🎱 Bola Mágica', campos: [{ name: '❓ Pergunta', value: p }, { name: '🎱 Resposta', value: respostas[Math.floor(Math.random() * respostas.length)] }] });
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};