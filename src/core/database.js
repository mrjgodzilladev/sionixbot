const path = require('path'); const fs = require('fs'); const Database = require('better-sqlite3'); const log = require('./logger');

// O banco de dados fica na pasta "data/". Se ela não existir, a gente cria.
// Pensa no banco como o "caderninho" do bot, onde ele anota as coisas importantes.
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'sionix.db'));

// Esses são ajustes de "modo de usar" do banco.
// Eles deixam o SQLite mais rápido e evitam que ele corrompa se o bot cair de repente.
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000'); // Se o banco estiver ocupado, espera até 5 segundos antes de dar erro.

// Aqui a gente cria as "gavetas" (tabelas) do caderninho.
// Se elas já existirem, ele ignora e não faz nada.
db.exec(`
  CREATE TABLE IF NOT EXISTS warns (id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, user_id TEXT, moderator_id TEXT, reason TEXT, created_at INTEGER);
  CREATE TABLE IF NOT EXISTS giveaways (id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, channel_id TEXT, message_id TEXT UNIQUE, prize TEXT, winners INTEGER, ends_at INTEGER, ended INTEGER DEFAULT 0, host_id TEXT);
  CREATE TABLE IF NOT EXISTS giveaway_entries (giveaway_id INTEGER, user_id TEXT, PRIMARY KEY (giveaway_id, user_id));
  CREATE TABLE IF NOT EXISTS tickets (id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, channel_id TEXT UNIQUE, user_id TEXT, category TEXT, status TEXT DEFAULT 'aberto', created_at INTEGER, closed_at INTEGER, closed_by TEXT, close_reason TEXT);
  CREATE TABLE IF NOT EXISTS afk (guild_id TEXT, user_id TEXT, reason TEXT, since INTEGER, PRIMARY KEY (guild_id, user_id));
  CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, channel_id TEXT, guild_id TEXT, mensagem TEXT, expires_at INTEGER);
  CREATE TABLE IF NOT EXISTS suggestions (id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, channel_id TEXT, message_id TEXT UNIQUE, author_id TEXT, content TEXT, anonymous INTEGER, upvotes INTEGER DEFAULT 0, downvotes INTEGER DEFAULT 0, created_at INTEGER);
  CREATE TABLE IF NOT EXISTS suggestion_votes (suggestion_id INTEGER, user_id TEXT, vote TEXT, PRIMARY KEY (suggestion_id, user_id));
  CREATE TABLE IF NOT EXISTS tempbans (id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, user_id TEXT, moderator_id TEXT, reason TEXT, unban_at INTEGER);
  CREATE TABLE IF NOT EXISTS stats_mod (id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, moderator_id TEXT, alvo_id TEXT, acao TEXT, motivo TEXT, created_at INTEGER);
  CREATE TABLE IF NOT EXISTS polls (id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT, channel_id TEXT, message_id TEXT UNIQUE, question TEXT, options TEXT, created_at INTEGER);
  CREATE TABLE IF NOT EXISTS poll_votes (poll_id INTEGER, user_id TEXT, option_index INTEGER, PRIMARY KEY (poll_id, user_id));
`);
log.info('Banco de dados conectado com sucesso! 🗄️');

// Daqui pra baixo, estão as funções que os comandos usam para ler e escrever no banco.
// Por exemplo: "addWarn" adiciona um aviso, "getEntries" vê quem entrou num sorteio, etc.
module.exports = {
    raw: db,
    addWarn: (g, u, m, r) => db.prepare('INSERT INTO warns (guild_id, user_id, moderator_id, reason, created_at) VALUES (?,?,?,?,?)').run(g, u, m, r, Date.now()),
    getWarns: (g, u) => db.prepare('SELECT * FROM warns WHERE guild_id=? AND user_id=? ORDER BY created_at DESC').all(g, u),
    countWarns: (g, u) => db.prepare('SELECT COUNT(*) AS c FROM warns WHERE guild_id=? AND user_id=?').get(g, u).c,
    removeWarn: (id, g) => db.prepare('DELETE FROM warns WHERE id=? AND guild_id=?').run(id, g),
    clearWarns: (g, u) => db.prepare('DELETE FROM warns WHERE guild_id=? AND user_id=?').run(g, u),
    createGiveaway: (g, c, m, p, w, e, h) => db.prepare('INSERT INTO giveaways (guild_id,channel_id,message_id,prize,winners,ends_at,host_id) VALUES (?,?,?,?,?,?,?)').run(g, c, m, p, w, e, h),
    getActiveGiveaways: () => db.prepare('SELECT * FROM giveaways WHERE ended=0').all(),
    getGiveawayByMessage: (m) => db.prepare('SELECT * FROM giveaways WHERE message_id=?').get(m),
    enterGiveaway: (g, u) => db.prepare('INSERT OR IGNORE INTO giveaway_entries (giveaway_id,user_id) VALUES (?,?)').run(g, u),
    getEntries: (g) => db.prepare('SELECT user_id FROM giveaway_entries WHERE giveaway_id=?').all(g),
    endGiveaway: (g) => db.prepare('UPDATE giveaways SET ended=1 WHERE id=?').run(g),
    createTicket: (g, c, u, cat) => db.prepare('INSERT INTO tickets (guild_id,channel_id,user_id,category,created_at) VALUES (?,?,?,?,?)').run(g, c, u, cat, Date.now()),
    getTicketByChannel: (c) => db.prepare('SELECT * FROM tickets WHERE channel_id=?').get(c),
    closeTicket: (c, u, r) => db.prepare('UPDATE tickets SET status=?, closed_at=?, closed_by=?, close_reason=? WHERE channel_id=?').run('fechado', Date.now(), u, r, c),
    setAfk: (g, u, r) => db.prepare('INSERT OR REPLACE INTO afk (guild_id,user_id,reason,since) VALUES (?,?,?,?)').run(g, u, r, Date.now()),
    getAfk: (g, u) => db.prepare('SELECT * FROM afk WHERE guild_id=? AND user_id=?').get(g, u),
    removeAfk: (g, u) => db.prepare('DELETE FROM afk WHERE guild_id=? AND user_id=?').run(g, u),
    addReminder: (u, c, g, m, e) => db.prepare('INSERT INTO reminders (user_id,channel_id,guild_id,mensagem,expires_at) VALUES (?,?,?,?,?)').run(u, c, g, m, e),
    getAllReminders: () => db.prepare('SELECT * FROM reminders ORDER BY expires_at ASC').all(),
    removeReminder: (id, u) => db.prepare('DELETE FROM reminders WHERE id=? AND user_id=?').run(id, u),
    createSuggestion: (g, c, m, a, co, an) => db.prepare('INSERT INTO suggestions (guild_id,channel_id,message_id,author_id,content,anonymous,created_at) VALUES (?,?,?,?,?,?,?)').run(g, c, m, a, co, an ? 1 : 0, Date.now()),
    getSuggestionByMessage: (m) => db.prepare('SELECT * FROM suggestions WHERE message_id=?').get(m),
    voteSuggestion: (id, u, v) => {
        // A "transaction" é uma forma segura de fazer várias coisas no banco de uma vez.
        // Se der erro no meio, ele desfaz tudo e não deixa nada pela metade.
        const transaction = db.transaction((id, u, v) => {
            const ex = db.prepare('SELECT vote FROM suggestion_votes WHERE suggestion_id=? AND user_id=?').get(id, u);
            if (ex) {
                db.prepare('UPDATE suggestions SET upvotes=upvotes-?, downvotes=downvotes-? WHERE id=?').run(ex.vote === 'up' ? 1 : 0, ex.vote === 'down' ? 1 : 0, id);
                if (ex.vote === v) { db.prepare('DELETE FROM suggestion_votes WHERE suggestion_id=? AND user_id=?').run(id, u); return { removido: true }; }
            }
            db.prepare('INSERT OR REPLACE INTO suggestion_votes (suggestion_id,user_id,vote) VALUES (?,?,?)').run(id, u, v);
            db.prepare(`UPDATE suggestions SET ${v === 'up' ? 'upvotes' : 'downvotes'}=${v === 'up' ? 'upvotes' : 'downvotes'}+1 WHERE id=?`).run(id);
            return { voto: v };
        });
        return transaction(id, u, v);
    },
    addTempban: (g, u, m, r, e) => db.prepare('INSERT INTO tempbans (guild_id,user_id,moderator_id,reason,unban_at) VALUES (?,?,?,?,?)').run(g, u, m, r, e),
    getAllTempbans: () => db.prepare('SELECT * FROM tempbans ORDER BY unban_at ASC').all(),
    removeTempban: (id) => db.prepare('DELETE FROM tempbans WHERE id=?').run(id),
    registrarAcao: (g, m, a, ac, mo) => db.prepare('INSERT INTO stats_mod (guild_id,moderator_id,alvo_id,acao,motivo,created_at) VALUES (?,?,?,?,?,?)').run(g, m, a, ac, mo, Date.now()),
    getStatsModerador: (g, m, d) => db.prepare('SELECT acao, COUNT(*) AS total FROM stats_mod WHERE guild_id=? AND moderator_id=? AND created_at>=? GROUP BY acao').all(g, m, d),
    getHistoricoAlvo: (g, a) => db.prepare('SELECT * FROM stats_mod WHERE guild_id=? AND alvo_id=? ORDER BY created_at DESC').all(g, a),

    // Funções das enquetes
    createPoll: (g, c, m, q, opts) => db.prepare('INSERT INTO polls (guild_id,channel_id,message_id,question,options,created_at) VALUES (?,?,?,?,?,?)').run(g, c, m, q, JSON.stringify(opts), Date.now()),
    getPollByMessage: (m) => db.prepare('SELECT * FROM polls WHERE message_id=?').get(m),
    votePoll: (pollId, userId, optionIndex) => db.prepare('INSERT OR REPLACE INTO poll_votes (poll_id,user_id,option_index) VALUES (?,?,?)').run(pollId, userId, optionIndex),
    getPollResults: (pollId) => db.prepare('SELECT option_index, COUNT(*) as count FROM poll_votes WHERE poll_id=? GROUP BY option_index').all(pollId),
    getUserPollVote: (pollId, userId) => db.prepare('SELECT option_index FROM poll_votes WHERE poll_id=? AND user_id=?').get(pollId, userId)
};