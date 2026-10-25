const { PermissionsBitField } = require('discord.js');
const { erro, safeReply } = require('./embed');

const pegarGuild = (ctx) => ctx.interaction?.guild || ctx.message?.guild;
const pegarMember = (ctx) => ctx.interaction?.member || ctx.message?.member;
const responder = (ctx, embed) => safeReply(ctx, { embeds: [embed] });

const nomesPermissoes = {
    'BanMembers': 'Banir Membros', 'KickMembers': 'Expulsar Membros',
    'ManageMessages': 'Gerenciar Mensagens', 'ModerateMembers': 'Castigar Membros',
    'ManageChannels': 'Gerenciar Canais', 'Administrator': 'Administrador',
    'ManageRoles': 'Gerenciar Cargos'
};

module.exports = {
    precisaPermissao: (ctx, p) => {
        const member = pegarMember(ctx);
        const guild = pegarGuild(ctx);
        if (member?.id === guild?.ownerId) return true;

        if (!member?.permissions.has(PermissionsBitField.Flags[p])) {
            responder(ctx, erro(`Você não tem a permissão de **${nomesPermissoes[p] || p}** pra fazer isso. Pede pro admin do servidor te dar essa permissão!`));
            return false;
        }
        return true;
    },
    precisaBotPermissao: (ctx, p) => {
        const guild = pegarGuild(ctx);
        const canal = ctx.interaction?.channel || ctx.message?.channel;
        const bot = guild?.members?.me;

        if (bot?.permissions.has(PermissionsBitField.Flags.Administrator)) return true;

        if (!bot?.permissionsIn(canal).has(PermissionsBitField.Flags[p])) {
            responder(ctx, erro(`Eu não consigo fazer isso porque não tenho a permissão de **${nomesPermissoes[p] || p}** neste canal.\n\n**O que você pode fazer:** Peça para um admin subir meu cargo ou me dar essa permissão.`));
            return false;
        }
        return true;
    },
    podePunir: (ctx, alvo) => {
        const guild = pegarGuild(ctx);
        const autor = pegarMember(ctx);
        const bot = guild?.members?.me;
        const falhar = (m) => { responder(ctx, erro(m)); return false; };

        if (!alvo) return falhar('Não achei esse membro. Ele ainda tá no servidor?');
        if (alvo.id === autor.id) return falhar('Você não pode aplicar isso em você mesmo, né? 😅');
        if (alvo.id === bot.id) return falhar('Eu não posso aplicar isso em mim mesmo. 😅');
        if (alvo.id === guild.ownerId) return falhar('Não dá pra punir o dono do servidor, né?');
        if (autor.id !== guild.ownerId && autor.roles.highest.position <= alvo.roles.highest.position) return falhar('Você não pode punir alguém com cargo maior ou igual ao seu.');
        if (bot.roles.highest.position <= alvo.roles.highest.position) return falhar('Eu não posso punir essa pessoa porque o cargo dela é maior que o meu. Pede pro admin subir meu cargo na lista!');
        return true;
    },
    resolverMembro: async (ctx, input) => {
        const guild = pegarGuild(ctx);
        const id = String(input || '').replace(/[<@!>]/g, ''); if (!/^\d+$/.test(id)) return null;
        return guild.members.fetch(id).catch(() => null);
    }
};