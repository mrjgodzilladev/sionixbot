const { AttachmentBuilder } = require('discord.js');
module.exports = {
    gerarTranscript: async (canal) => {
        const msgs = await canal.messages.fetch({ limit: 500 }).catch(()=>null); if (!msgs) return null;
        let txt = `=== TICKET: #${canal.name} ===\nGerado em: ${new Date().toLocaleString('pt-BR')}\nTotal: ${msgs.size}\n${'='.repeat(40)}\n\n`;
        [...msgs.values()].sort((a,b)=>a.createdTimestamp-b.createdTimestamp).forEach(m => { txt += `[${new Date(m.createdTimestamp).toLocaleString('pt-BR')}] ${m.author.tag}\n${m.content || '*[sem texto]*'}\n\n`; });
        return new AttachmentBuilder(Buffer.from(txt, 'utf-8'), { name: `ticket-${canal.name}.txt` });
    }
};