const { SlashCommandBuilder } = require('discord.js');
const { base, erro } = require('../../core/embed');
const { check } = require('../../core/cooldown');

module.exports = {
    categoria: 'Util',
    exemplo: '!userinfo @fulano',
    data: new SlashCommandBuilder().setName('userinfo').setDescription('Informações de um usuário').addUserOption(o => o.setName('membro').setDescription('Quem?').setRequired(false)),
    async execute({ client, interaction, message, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'userinfo', 2000)) return;
        const alvo = isSlash ? (interaction.options.getUser('membro') || interaction.user) : (message.mentions.users.first() || message.author);
        const guild = isSlash ? interaction.guild : message.guild;
        const membro = await guild.members.fetch(alvo.id).catch(() => null);

        if (!membro) {
            const embed = erro('Esse usuário não está no servidor.');
            return isSlash ? interaction.reply({ embeds: [embed], flags: 64 }) : message.reply({ embeds: [embed] });
        }

        const cargos = membro.roles.cache.filter(r => r.id !== guild.id).sort((a, b) => b.position - a.position).map(r => `<@&${r.id}>`).slice(0, 10).join(' ') || '*Nenhum*';
        const embed = base({ titulo: alvo.username, thumbnail: alvo.displayAvatarURL({ size: 256 }), campos: [
                { name: '🆔 ID', value: `\`${alvo.id}\``, inline: true },
                { name: '🤖 Bot?', value: alvo.bot ? 'Sim' : 'Não', inline: true },
                { name: '📛 Apelido', value: membro.nickname || '*Sem apelido*', inline: true },
                { name: '📅 Conta criada em', value: `<t:${Math.floor(alvo.createdTimestamp / 1000)}:F>`, inline: false },
                { name: '📥 Entrou no servidor em', value: `<t:${Math.floor(membro.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: `🎭 Cargos (${membro.roles.cache.size - 1})`, value: cargos, inline: false }
            ]});
        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};