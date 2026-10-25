const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const { base, sucesso } = require('../../core/embed');
const { check } = require('../../core/cooldown');
const config = require('../../core/config');

module.exports = {
    categoria: 'Config',
    exemplo: '/config setlogs #canal',
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configura o bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub => sub.setName('ver').setDescription('Mostra a configuração atual'))
        .addSubcommand(sub => sub.setName('setlogs').setDescription('Define o canal de logs').addChannelOption(o => o.setName('canal').setDescription('Canal').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(sub => sub.setName('setprefix').setDescription('Muda o prefixo').addStringOption(o => o.setName('prefixo').setDescription('Novo prefixo').setRequired(true).setMinLength(1).setMaxLength(3)))
        .addSubcommand(sub => sub.setName('setticket').setDescription('Configura o cargo de suporte e a categoria dos tickets')
            .addRoleOption(o => o.setName('cargo_suporte').setDescription('Cargo que vai atender os tickets').setRequired(true))
            .addChannelOption(o => o.setName('categoria').setDescription('Categoria onde os tickets serão criados').addChannelTypes(ChannelType.GuildCategory).setRequired(false))
            .addChannelOption(o => o.setName('canal_transcript').setDescription('Canal onde os históricos serão salvos').addChannelTypes(ChannelType.GuildText).setRequired(false))
        ),

    async execute({ interaction, isSlash }) {
        if (!isSlash || !check(interaction.user.id, 'config', 2000)) return;
        const sub = interaction.options.getSubcommand();
        const cfg = JSON.parse(fs.readFileSync(config.CONFIG_PATH, 'utf8'));

        if (sub === 'ver') {
            const embed = base({ titulo: 'Configurações Atuais', campos: [
                    { name: 'Prefixo', value: `\`${cfg.prefix}\``, inline: true },
                    { name: 'Cor', value: `\`${cfg.embedColor}\``, inline: true },
                    { name: 'Logs', value: cfg.logs?.enabled ? `<#${cfg.logs.channelId}>` : 'Desativado', inline: false },
                    { name: 'Ticket Suporte', value: cfg.tickets?.supportRoleId ? `<@&${cfg.tickets.supportRoleId}>` : 'Não configurado', inline: true }
                ]});
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        if (sub === 'setlogs') {
            cfg.logs = { enabled: true, channelId: interaction.options.getChannel('canal').id };
            fs.writeFileSync(config.CONFIG_PATH, JSON.stringify(cfg, null, 2));
            return interaction.reply({ embeds: [sucesso('Canal de logs configurado! Reinicie o bot.')] });
        }

        if (sub === 'setprefix') {
            cfg.prefix = interaction.options.getString('prefixo');
            fs.writeFileSync(config.CONFIG_PATH, JSON.stringify(cfg, null, 2));
            return interaction.reply({ embeds: [sucesso(`Prefixo alterado para \`${cfg.prefix}\`! Reinicie o bot.`)] });
        }

        if (sub === 'setticket') {
            const cargo = interaction.options.getRole('cargo_suporte');
            const categoria = interaction.options.getChannel('categoria');
            const transcript = interaction.options.getChannel('canal_transcript');

            cfg.tickets = cfg.tickets || {};
            cfg.tickets.supportRoleId = cargo.id;
            if (categoria) cfg.tickets.categoryId = categoria.id;
            if (transcript) cfg.tickets.transcriptChannelId = transcript.id;

            fs.writeFileSync(config.CONFIG_PATH, JSON.stringify(cfg, null, 2));
            return interaction.reply({ embeds: [sucesso('Configuração de tickets atualizada! Reinicie o bot para aplicar.')] });
        }
    },
};