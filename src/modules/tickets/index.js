const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const { base, erro } = require('../../core/embed');
const config = require('../../core/config');
const db = require('../../core/database');
const { gerarTranscript } = require('../../core/transcript');

module.exports = {
    comandoPainel: {
        categoria: 'Config', exemplo: '/ticket-painel',
        data: new (require('discord.js').SlashCommandBuilder)().setName('ticket-painel').setDescription('Envia o painel de atendimento').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute({ interaction }) {
            if (!interaction.isChatInputCommand()) return;
            const embed = base({ titulo: '🎫 Central de Atendimento', descricao: 'Selecione abaixo o motivo do seu contato para abrir um ticket privado com a nossa equipe.' });
            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('ticket:menu').setPlaceholder('Escolha o tipo...').addOptions(config.tickets.categories.map(cat => ({ label: cat, value: cat, emoji: '📩' })))
            );
            await interaction.channel.send({ embeds: [embed], components: [menu] });
            await interaction.reply({ content: '✅ Painel de tickets enviado!', flags: 64 });
        }
    },
    abrirTicket: async (interaction) => {
        const guild = interaction.guild; const user = interaction.user; const categoria = interaction.values[0];

        if (!config.tickets.supportRoleId) return interaction.reply({ embeds: [erro('O sistema de tickets não está configurado corretamente. O administrador precisa definir o `supportRoleId`.')], flags: 64 });

        await interaction.deferReply({ flags: 64 });
        const canalExistente = guild.channels.cache.find(c => c.name === `ticket-${user.id}`); // ETAPA 3: Nome seguro
        if (canalExistente) return interaction.editReply({ content: `Você já tem um ticket aberto em <#${canalExistente.id}>!` });

        try {
            const canal = await guild.channels.create({
                name: `ticket-${user.id}`, // ETAPA 3: Nome seguro
                type: ChannelType.GuildText,
                parent: config.tickets.categoryIds?.[categoria] || config.tickets.categoryId || null,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: config.tickets.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ],
            });

            db.createTicket(guild.id, canal.id, user.id, categoria);
            const embedBoasVindas = base({ titulo: `🎫 Ticket: ${categoria}`, descricao: `Olá, ${user}! Sua solicitação foi aberta. A equipe de **${categoria}** já foi notificada.\n\n**Para fechar o ticket, clique no botão abaixo.**` });
            const botaoFechar = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket:fechar').setLabel('Fechar Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger));

            await canal.send({ content: `${user} <@&${config.tickets.supportRoleId}>`, embeds: [embedBoasVindas], components: [botaoFechar] });
            await interaction.editReply({ content: `✅ Ticket criado com sucesso em ${canal}!` });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Erro ao criar o ticket. Verifique minhas permissões.' });
        }
    },
    fecharTicket: async (interaction) => {
        const channel = interaction.channel;
        const ticketInfo = db.getTicketByChannel(channel.id);
        if (!ticketInfo) return interaction.reply({ embeds: [erro('Esse canal não é um ticket registrado.')], flags: 64 });

        await interaction.reply({ content: '🔒 Fechando ticket e gerando transcript em 5 segundos...' });
        db.closeTicket(channel.id, interaction.user.id, 'Fechado via botão');

        if (config.tickets.transcriptChannelId) {
            const canalLogs = await interaction.guild.channels.fetch(config.tickets.transcriptChannelId).catch(() => null);
            if (canalLogs) {
                const arquivo = await gerarTranscript(channel);
                const embedLog = base({ titulo: 'Ticket Fechado', descricao: `Ticket de <@${ticketInfo.user_id}> (${ticketInfo.category}) fechado por ${interaction.user}.`, tipo: 'aviso' });
                await canalLogs.send({ embeds: [embedLog], files: arquivo ? [arquivo] : [] });
            }
        }
        setTimeout(() => channel.delete().catch(() => {}), 5000);
    }
};