const { SlashCommandBuilder } = require('discord.js');
const { base } = require('../../core/embed');
const { check } = require('../../core/cooldown');

module.exports = {
    categoria: 'Util',
    exemplo: '!avatar @fulano',
    data: new SlashCommandBuilder().setName('avatar').setDescription('Mostra a foto de perfil').addUserOption(o => o.setName('membro').setDescription('De quem?').setRequired(false)),
    async execute({ client, interaction, message, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'avatar', 2000)) return;
        const alvo = isSlash ? (interaction.options.getUser('membro') || interaction.user) : (message.mentions.users.first() || message.author);
        const membro = await (isSlash ? interaction.guild : message.guild).members.fetch(alvo.id).catch(() => null);
        const aGlobal = alvo.displayAvatarURL({ size: 1024, extension: 'png' });
        const aServer = membro?.avatarURL({ size: 1024, extension: 'png' });

        const campos = [{ name: '🌐 Global', value: `[Clique aqui](${aGlobal})`, inline: true }];
        if (aServer) campos.push({ name: '🏠 Servidor', value: `[Clique aqui](${aServer})`, inline: true });

        const embed = base({ titulo: `Avatar de ${alvo.username}`, imagem: aServer || aGlobal, thumbnail: aGlobal, campos });
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};