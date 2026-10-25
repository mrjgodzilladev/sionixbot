const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { base, erro } = require('../../core/embed');
const { check } = require('../../core/cooldown');
const config = require('../../core/config');
const db = require('../../core/database');

module.exports = {
    categoria: 'Social',
    exemplo: '/sugestao',
    data: new SlashCommandBuilder()
        .setName('sugestao')
        .setDescription('Envia uma sugestão')
        .addStringOption(o => o.setName('texto').setDescription('Sua sugestão').setRequired(true))
        .addBooleanOption(o => o.setName('anonimo').setDescription('Deseja enviar anonimamente?').setRequired(false)),

    async execute({ interaction, isSlash }) {
        if (!isSlash || !check(interaction.user.id, 'sugestao', 10000)) return;

        if (!config.sugestoes.channelId) return interaction.reply({ embeds: [erro('O canal de sugestões não está configurado no servidor.')], flags: 64 });

        const texto = interaction.options.getString('texto');
        const anonimo = interaction.options.getBoolean('anonimo') || config.sugestoes.anonymousDefault;

        const canal = await interaction.guild.channels.fetch(config.sugestoes.channelId).catch(() => null);
        if (!canal) return interaction.reply({ embeds: [erro('Não achei o canal de sugestões.')], flags: 64 });

        const embed = base({
            titulo: '💡 Nova Sugestão',
            descricao: texto,
            rodape: anonimo ? 'Enviado por: Anônimo' : `Enviado por: ${interaction.user.tag}`,
            campos: [{ name: 'Votos 👍', value: '0', inline: true }, { name: 'Votos 👎', value: '0', inline: true }]
        });

        const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('sugestao:up').setEmoji('👍').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('sugestao:down').setEmoji('👎').setStyle(ButtonStyle.Danger)
        );

        const msg = await canal.send({ embeds: [embed], components: [botoes] });

        if (config.sugestoes.createThread) {
            await msg.startThread({ name: 'Discussão da Sugestão' }).catch(() => {});
        }

        db.createSuggestion(interaction.guild.id, canal.id, msg.id, interaction.user.id, texto, anonimo);

        await interaction.reply({ content: '✅ Sugestão enviada com sucesso!', flags: 64 });
    }
};