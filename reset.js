const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Limpando comandos...');
        // Substitua pelo ID do seu bot (não é o token, é o ID da aplicação)
        const CLIENT_ID = "1563228142754201681";

        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), { body: [] });
        console.log('✅ Comandos limpos!');
    } catch (error) {
        console.error(error);
    }
})();