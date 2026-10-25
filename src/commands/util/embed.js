const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { erro } = require('../../core/embed');
const { check } = require('../../core/cooldown');
const config = require('../../core/config');

module.exports = {
    categoria: 'Util',
    exemplo: '/embed',
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Cria uma mensagem bonita (embed)')
        .addStringOption(o => o.setName('titulo').setDescription('Título do embed').setRequired(true))
        .addStringOption(o => o.setName('descricao').setDescription('Texto principal').setRequired(true))
        .addStringOption(o => o.setName('cor').setDescription('Cor em HEX (ex: #FF0000)').setRequired(false))
        .addStringOption(o => o.setName('rodape').setDescription('Texto do rodapé').setRequired(false))
        .addStringOption(o => o.setName('imagem').setDescription('URL de uma imagem').setRequired(false)),

    async execute({ interaction, isSlash }) {
        if (!isSlash) return;
        if (!check(interaction.user.id, 'embed', 3000)) return;

        const titulo = interaction.options.getString('titulo');
        const descricao = interaction.options.getString('descricao');
        let cor = interaction.options.getString('cor') || config.embedColor;
        const rodape = interaction.options.getString('rodape') || 'SionixBot 🌀';
        const imagem = interaction.options.getString('imagem');

        // Validação simples da cor (precisa ter # + 6 caracteres)
        const regexHex = /^#([0-9A-F]{3}){1,2}$/i;
        if (!regexHex.test(cor)) {
            cor = config.embedColor; // Se o cara digitar errado, usa a cor padrão
        }

        const embed = new EmbedBuilder()
            .setColor(cor)
            .setTitle(titulo)
            .setDescription(descricao)
            .setFooter({ text: rodape })
            .setTimestamp();

        if (imagem) embed.setImage(imagem);

        const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('embed:enviar').setLabel('Enviar').setEmoji('📤').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('embed:cancelar').setLabel('Cancelar').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            content: '👀 **Preview do Embed:**',
            embeds: [embed],
            components: [botoes],
            flags: 64,
        });
    },
};