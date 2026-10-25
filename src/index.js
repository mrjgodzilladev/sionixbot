const log = require('./core/logger');
const { Client, GatewayIntentBits, Options, Partials } = require('discord.js');
const config = require('./core/config');
const { loadCommands, loadEvents } = require('./core/loader');
const scheduler = require('./core/scheduler');
const giveawayModule = require('./modules/giveaway');

// Aqui a gente configura o "corpo" do bot. Os intents são os ouvidos dele:
// quais coisas do Discord ele tem permissão de escutar.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,              // Saber dos servidores
        GatewayIntentBits.GuildMessages,       // Ler as mensagens
        GatewayIntentBits.MessageContent,      // Ler o TEXTO das mensagens (pro prefixo ! funcionar)
        GatewayIntentBits.GuildMembers,        // Saber quem entra e sai (necessário pra moderação)
        GatewayIntentBits.GuildMessageReactions, // Ouvir reações (pro giveaway funcionar)
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],

    // O cache é a "memória de curto prazo" do bot.
    // A gente limitou tudo pra ele não gastar RAM demais em host free.
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
        MessageManager: 0, PresenceManager: 0, ReactionManager: 0, GuildMemberManager: 200, ThreadManager: 0, VoiceStateManager: 0,
    }),

    // Sweepers são "faxineiros" automáticos. De vez em quando eles limpam o cache.
    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: { interval: 300, lifetime: 600 },
    },
});

loadCommands(client);
loadEvents(client);

log.boot('Ligando o SionixBot... 🌀');
client.login(config.token).then(() => {
    // Quando ligar, a gente liga os "serviços em background": os lembretes e sorteios.
    scheduler.iniciar(client);
    giveawayModule.iniciarSorteios(client);
}).catch((err) => {
    log.error('Erro no login:', err.message);
    process.exit(1);
});

// Se você apertar Ctrl+C no terminal, ele fecha o banco de dados com segurança antes de sair.
// Isso evita que o banco corrompa.
process.on('SIGINT', () => {
    log.info('Desligando o bot com segurança...');
    require('./core/database').raw.close();
    process.exit(0);
});

// Se der algum erro esquisito no meio do código, o bot loga e continua vivo em vez de fechar.
process.on('unhandledRejection', (err) => log.error('Promise rejeitada:', err));
process.on('uncaughtException', (err) => log.error('Exceção não capturada:', err));