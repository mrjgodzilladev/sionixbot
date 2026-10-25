const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { base, erro } = require('../../core/embed');

module.exports = {
    categoria: 'Config', exemplo: '/setup',
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Abre o assistente de configuração do bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute({ interaction, isSlash }) {
        if (!isSlash) return;

        const embed = base({
            titulo: '⚙️ Assistente de Configuração',
            descricao: 'Olá! Vou te ajudar a configurar o SionixBot.\nEscolha abaixo o que você quer configurar agora:',
            tipo: 'info',
        });

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('setup:menu')
                .setPlaceholder('Selecione uma opção...')
                .addOptions([
                    { label: 'Canal de Logs', value: 'logs', description: 'Configura o canal onde as ações de moderação serão registradas.', emoji: '📋' },
                    { label: 'Sistema de Tickets', value: 'tickets', description: 'Configura o cargo de suporte e as categorias.', emoji: '🎫' },
                    { label: 'Mensagem de Boas-Vindas', value: 'welcome', description: 'Configura o canal de boas-vindas.', emoji: '👋' },
                    { label: 'Sistema de Sugestões', value: 'sugestoes', description: 'Configura o canal de sugestões.', emoji: '💡' },
                    { label: 'Sorteios e Giveaways', value: 'giveaway', description: 'Saiba mais sobre como criar sorteios.', emoji: '🎉' },
                ])
        );

        return interaction.reply({ embeds: [embed], components: [menu], flags: 64 });
    }
};