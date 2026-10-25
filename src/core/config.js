const fs = require('fs'); const path = require('path'); const log = require('./logger');
require('dotenv').config();
const ROOT = path.join(__dirname, '..', '..');
const CONFIG_PATH = path.join(ROOT, 'config.json');
if (!fs.existsSync(CONFIG_PATH)) {
    if (fs.existsSync(path.join(ROOT, 'config.example.json'))) {
        fs.copyFileSync(path.join(ROOT, 'config.example.json'), CONFIG_PATH);
        log.warn('config.json criado a partir do example.');
    } else { log.error('Falta o config.example.json!'); process.exit(1); }
}
let config; try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch (err) { log.error('config.json quebrado (JSON inválido).'); process.exit(1); }
if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN === 'cole_seu_token_aqui') { log.error('DISCORD_TOKEN não configurado no .env.'); process.exit(1); }
module.exports = { token: process.env.DISCORD_TOKEN, guildId: process.env.GUILD_ID || null, ownerId: process.env.OWNER_ID || null, ...config, ROOT, CONFIG_PATH };