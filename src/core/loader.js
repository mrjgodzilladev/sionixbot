const fs = require('fs');
const path = require('path');
const log = require('./logger');

function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    let out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const f = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...walk(f));
        else if (e.name.endsWith('.js')) out.push(f);
    }
    return out;
}

module.exports = {
    loadCommands: (client) => {
        const commands = new Map();

        // 1. Carrega comandos normais (src/commands)
        for (const file of walk(path.join(__dirname, '..', 'commands'))) {
            try {
                delete require.cache[require.resolve(file)];
                const cmd = require(file);
                if (cmd?.data && cmd.execute) commands.set(cmd.data.name, { ...cmd, file });
            } catch (e) {
                log.error(`Erro no comando ${path.basename(file)}:`, e.message);
            }
        }

        // 2. Carrega os comandos que estão DENTRO dos módulos (src/modules)
        for (const file of walk(path.join(__dirname, '..', 'modules'))) {
            try {
                delete require.cache[require.resolve(file)];
                const moduleExports = require(file);

                // Procura por propriedades que tenham 'data' e 'execute' (ex: comandoPainel, comandoCriar)
                for (const key in moduleExports) {
                    if (moduleExports[key] && moduleExports[key].data && moduleExports[key].execute) {
                        commands.set(moduleExports[key].data.name, { ...moduleExports[key], file });
                    }
                }
            } catch (e) {
                log.error(`Erro no módulo ${path.basename(file)}:`, e.message);
            }
        }

        client.commands = commands;
        log.info(`${commands.size} comando(s) carregado(s) 🎮`);
    },

    loadEvents: (client) => {
        let count = 0;
        for (const file of walk(path.join(__dirname, '..', 'events'))) {
            try {
                delete require.cache[require.resolve(file)];
                const evt = require(file);
                if (evt?.name && evt.execute) {
                    evt.once ? client.once(evt.name, (...a) => evt.execute(...a, client)) : client.on(evt.name, (...a) => evt.execute(...a, client));
                    count++;
                }
            } catch (e) {
                log.error(`Erro no evento ${path.basename(file)}:`, e.message);
            }
        }
        log.info(`${count} evento(s) carregado(s) 🎧`);
    }
};