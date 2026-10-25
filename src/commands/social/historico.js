const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { base, erro } = require('../../core/embed');
const { check } = require('../../core/cooldown');
const db = require('../../core/database');
const config = require('../../core/config');

// Função para montar o embed da enquete com a contagem atualizada
async function montarEmbedPoll(poll) {
    const opts = JSON.parse(poll.options);
    const results = db.getPollResults(poll.id);

    // Cria um array de contagem baseado nas opções
    const counts = new Array(opts.length).fill(0);
    results.forEach(r => { counts[r.option_index] = r.count; });

    const totalVotos = counts.reduce((a, b) => a + b, 0);
    const descricao = `**${poll.question}**\n\n` + opts.map((opt, i) => {
        const pct = totalVotos === 0 ? 0 : Math.round((counts[i] / totalVotos) * 100);
        // Cria uma barrinha visual (até 10 quadradinhos)
        const barra = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
        return `**${i + 1}.** ${opt}\n${barra} ${pct}% (${counts[i]} votos)`;
    }).join('\n\n');

    return base({
        titulo: '📊 Enquete',
        descricao,
        rodape: `Total de votos: ${totalVotos} • Clique em um botão para votar`
    });
}

module.exports = {
    categoria: 'Social', exemplo: '/enquete',
    data: new SlashCommandBuilder().setName('enquete').setDescription('Cria uma enquete').addStringOption(o => o.setName('pergunta').setDescription('A pergunta').setRequired(true)).addStringOption(o => o.setName('opcoes').setDescription('Separe as opções por vírgula (máximo 5)').setRequired(true)),
    async execute({ interaction, isSlash }) {
        if (!isSlash || !check(interaction.user.id, 'enquete', 5000)) return;
        const pergunta = interaction.options.getString('pergunta');
        const opcoes = interaction.options.getString('opcoes').split(',').map(o => o.trim()).slice(0, 5);

        if (opcoes.length < 2) return interaction.reply({ embeds: [erro('Precisa de pelo menos 2 opções separadas por vírgula.')], flags: 64 });

        // Envia a mensagem inicial
        const embed = base({ titulo: '📊 Enquete', descricao: `**${pergunta}**\n\n` + opcoes.map((op, i) => `**${i + 1}.** ${op}`).join('\n\n'), rodape: 'Criada por ' + interaction.user.username });

        const botoes = new ActionRowBuilder();
        opcoes.forEach((op, i) => {
            botoes.addComponents(new ButtonBuilder().setCustomId(`enquete:${i}`).setLabel(`${i + 1}`).setStyle(ButtonStyle.Primary));
        });

        const msg = await interaction.reply({ embeds: [embed], components: [botoes], fetchReply: true });

        // Salva no banco
        db.createPoll(interaction.guild.id, interaction.channel.id, msg.id, pergunta, opcoes);
    }
};

// Exporta a função para ser usada no interactionCreate
module.exports.montarEmbedPoll = montarEmbedPoll;