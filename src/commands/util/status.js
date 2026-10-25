const { SlashCommandBuilder, version } = require('discord.js');
const { base } = require('../../core/embed');
const { check } = require('../../core/cooldown');

function formatarTempo(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

module.exports = {
    categoria: 'Util', exemplo: '/status',
    data: new SlashCommandBuilder().setName('status').setDescription('Mostra como o bot está se sentindo'),
    async execute({ client, interaction, isSlash }) {
        if (!isSlash || !check(interaction.user.id, 'status', 5000)) return;

        const memoria = process.memoryUsage();
        const ramMB = (memoria.heapUsed / 1024 / 1024).toFixed(2);
        const rssMB = (memoria.rss / 1024 / 1024).toFixed(2);
        const ping = Math.round(client.ws.ping);

        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(__dirname, '..', '..', '..', 'data', 'sionix.db');
        let tamanhoDb = '0 KB';
        try {
            const stats = fs.statSync(dbPath);
            tamanhoDb = (stats.size / 1024).toFixed(2) + ' KB';
        } catch {}

        const embed = base({
            titulo: 'Como eu estou?',
            descricao: `Tô vivo há **${formatarTempo(client.uptime)}** e respondendo rápido. Tudo certo por aqui! 🌀`,
            tipo: 'info',
            thumbnail: client.user.displayAvatarURL(),
            campos: [
                { name: '📡 Internet do Bot', value: `\`${ping}ms\``, inline: true },
                { name: '🏠 Servidores', value: `\`${client.guilds.cache.size}\``, inline: true },
                { name: '🧠 Memória', value: `\`${ramMB} MB\``, inline: true },
                { name: '💾 Memória do Sistema', value: `\`${rssMB} MB\``, inline: true },
                { name: '🗄️ Tamanho do Banco', value: `\`${tamanhoDb}\``, inline: true },
                { name: '⚙️ Comandos', value: `${client.commands.size}`, inline: true }
            ],
            rodape: `SionixBot 🌀 • Node ${process.version} • discord.js v${version}`,
        });

        return interaction.reply({ embeds: [embed], flags: 64 });
    }
};