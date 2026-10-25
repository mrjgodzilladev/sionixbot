const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { base } = require('../../core/embed');
const config = require('../../core/config');
const { check } = require('../../core/cooldown');

module.exports = {
    categoria: 'Util',
    exemplo: '!help ou /help',
    data: new SlashCommandBuilder().setName('help').setDescription('Mostra a lista de comandos').addStringOption(o => o.setName('comando').setDescription('Ver detalhes de um comando').setRequired(false)),
    async execute({ client, interaction, message, args, isSlash }) {
        if (!check(isSlash ? interaction.user.id : message.author.id, 'help', 2000)) return;
        const alvo = isSlash ? interaction.options.getString('comando') : args[0];

        if (alvo) {
            const cmd = client.commands.get(alvo.toLowerCase());
            if (!cmd) return isSlash ? interaction.reply({ content: 'Comando não encontrado.', flags: 64 }) : message.reply('Comando não encontrado.');
            const embed = base({ titulo: `Comando: ${cmd.data.name}`, campos: [
                    { name: '📝 O que faz', value: cmd.data.description || 'Sem descrição.', inline: false },
                    { name: '📂 Categoria', value: cmd.categoria || 'Outros', inline: true },
                    { name: '💡 Exemplo', value: `\`${cmd.exemplo || `!${cmd.data.name}`}\``, inline: true }
                ]});
            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        }

        const cats = new Map();
        for (const c of client.commands.values()) {
            const cat = c.categoria || 'Outros';
            if (!cats.has(cat)) cats.set(cat, []);
            cats.get(cat).push(c.data.name);
        }

        const embed = base({ titulo: 'Central de Ajuda', descricao: `Olá! Eu sou o SionixBot 🌀\nTenho **${client.commands.size}** comandos.\nPrefixo: \`${config.prefix}\``, campos: [...cats.entries()].map(([cat, cmds]) => ({ name: `📂 ${cat}`, value: cmds.map(c => `\`${c}\``).join(' • ') })) });
        let comps = [];
        if (isSlash) {
            comps = [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('help:selecionar').setPlaceholder('Ver detalhes...').addOptions([...client.commands.values()].slice(0, 25).map(c => ({ label: c.data.name, description: (c.data.description || '').slice(0, 100), value: c.data.name }))))];
        }
        return isSlash ? interaction.reply({ embeds: [embed], components: comps }) : message.reply({ embeds: [embed] });
    }
};