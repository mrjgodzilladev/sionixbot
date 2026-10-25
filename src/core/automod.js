const linksProibidos = ['discord.gg/', 'bit.ly/', 'tinyurl.com/'];
module.exports = {
    verificar: (message, config) => {
        if (!config.modules?.automod) return false;
        const cfg = config.automod || {};
        if (cfg.blockInvites && /(discord\.gg|discord\.com\/invite)\//i.test(message.content)) return 'Convite de servidor não é permitido.';
        if (cfg.blockEveryone && (message.content.includes('@everyone') || message.content.includes('@here')) && !message.member?.permissions.has('MentionEveryone')) return 'Menção em massa não permitida.';
        if (cfg.blockCaps && message.content.length >= (cfg.capsMinLength || 10) && message.content === message.content.toUpperCase() && /[A-Z]/.test(message.content)) return 'Evite usar apenas letras maiúsculas.';
        if (cfg.blockMentionSpam && message.mentions.users.size >= (cfg.mentionLimit || 5)) return 'Muitas menções na mesma mensagem.';
        if (cfg.blockShorteners && linksProibidos.some(l => message.content.includes(l))) return 'Links encurtados não são permitidos.';
        if (cfg.blockedWords?.length && cfg.blockedWords.some(p => message.content.toLowerCase().includes(p.toLowerCase()))) return 'Essa palavra não é permitida aqui.';
        return false;
    }
};