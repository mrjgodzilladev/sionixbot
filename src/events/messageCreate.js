/**
 * 🌀 EVENTO: messageCreate — ouve comandos por prefixo (!ping)
 */
const config = require('../core/config');
const log = require('../core/logger');
const { erro } = require('../core/embed');
const trust = require('../core/trust');
const automod = require('../core/automod');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // 1. Trust Score (Contas novas)
        if (!trust.verificar(message.member, config)) {
            message.delete().catch(() => {});
            return message.author.send({ embeds: [erro('Sua conta é muito nova para enviar mensagens aqui.')] }).catch(() => {});
        }

        // 2. AutoMod (Filtros de conteúdo)
        const motivoAutomod = automod.verificar(message, config);
        if (motivoAutomod) {
            message.delete().catch(() => {});
            return message.author.send({ embeds: [erro(`Sua mensagem foi removida: **${motivoAutomod}**`)] }).catch(() => {});
        }

        // 3. Execução de comandos
        if (!message.content.startsWith(config.prefix)) return;

        const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
        const cmdName = args.shift()?.toLowerCase();
        if (!cmdName) return;

        const comando = client.commands.get(cmdName);
        if (!comando) return;

        try {
            await comando.execute({ client, message, args, isSlash: false });
        } catch (err) {
            log.error(`Deu ruim em !${cmdName}:`, err);
            message.reply({ embeds: [erro('Erro ao executar o comando. 🔧')] }).catch(() => {});
        }
    },
};