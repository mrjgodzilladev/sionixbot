const log = require('./logger');
const { base } = require('./embed');

const timers = new Map();

// Função que agenda em blocos (máximo de 24h por timer para não estourar o limite do Node)
function agendarLembrete(client, r) {
    const tempoRestante = r.expires_at - Date.now();
    if (tempoRestante <= 0) {
        // Já passou da hora, executa agora
        return executarLembrete(client, r);
    }

    const delay = Math.min(tempoRestante, 86400000); // Max 24h
    const t = setTimeout(() => agendarLembrete(client, r), delay);
    timers.set(`l:${r.id}`, t);
}

function executarLembrete(client, r) {
    try {
        client.users.fetch(r.user_id).then(u => {
            if (u) u.send({ embeds: [base({ titulo: '⏰ Lembrete', descricao: r.mensagem, tipo: 'info' })] }).catch(()=>{});
        });
        require('./database').raw.prepare('DELETE FROM reminders WHERE id=?').run(r.id);
    } catch(e) { log.error(e); } finally { timers.delete(`l:${r.id}`); }
}

function agendarTempban(client, tb) {
    const tempoRestante = tb.unban_at - Date.now();
    if (tempoRestante <= 0) {
        return executarTempban(client, tb);
    }

    const delay = Math.min(tempoRestante, 86400000); // Max 24h
    const t = setTimeout(() => agendarTempban(client, tb), delay);
    timers.set(`t:${tb.id}`, t);
}

async function executarTempban(client, tb) {
    try {
        const g = await client.guilds.fetch(tb.guild_id).catch(()=>null);
        if (g) {
            await g.members.unban(tb.user_id, 'Tempban expirou').catch(()=>{});
            require('./database').removeTempban(tb.id);
            log.info(`Tempban expirou: ${tb.user_id}`);
        }
    } catch(e) {
        log.error(e);
    } finally {
        timers.delete(`t:${tb.id}`);
    }
}

module.exports = {
    iniciar: (client) => {
        const db = require('./database');
        const rs = db.getAllReminders();
        rs.forEach(r => agendarLembrete(client, r));
        log.info(`${rs.length} lembretes reagendados.`);

        const ts = db.getAllTempbans();
        ts.forEach(t => agendarTempban(client, t));
        log.info(`${ts.length} tempbans reagendados.`);
    },
    agendarLembrete,
    agendarTempban
};