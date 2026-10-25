const { REST, Routes } = require('discord.js');
const config = require('../core/config');
const log = require('../core/logger');

module.exports = {
    name: 'clientReady', // Nome novo exigido pela v14.16+
    once: true,
    async execute(client) {
        log.boot(`Logado como ${client.user.tag} 🎉`);
        log.boot(`Servidor(es): ${client.guilds.cache.size}`);

        if (!config.guildId) {
            log.warn('GUILD_ID vazio no .env — slash commands não serão registrados.');
            return;
        }

        try {
            const rest = new REST({ version: '10' }).setToken(config.token);
            const comandos = [...client.commands.values()].map(c => c.data.toJSON());

            await rest.put(
                Routes.applicationGuildCommands(client.user.id, config.guildId),
                { body: comandos }
            );
            log.info(`${comandos.length} slash command(s) registrado(s) ✅`);
        } catch (err) {
            log.error('Erro ao registrar slash commands:', err.message);
        }
    },
};