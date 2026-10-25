const log = require('../core/logger');
const { erro, base, safeReply } = require('../core/embed');
const db = require('../core/database');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // 1. Slash Commands
        if (interaction.isChatInputCommand()) {
            const cmd = client.commands.get(interaction.commandName);
            if (!cmd) return;
            try { await cmd.execute({ client, interaction, isSlash: true }); }
            catch (err) {
                log.error(`Deu ruim em /${interaction.commandName}:`, err);
                const payload = { embeds: [erro('Erro ao executar. 🔧')], flags: 64 };
                if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
                else await interaction.reply(payload).catch(() => {});
            }
            return;
        }

        // 2. Menus Suspensos
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'help:selecionar') {
                const cmd = client.commands.get(interaction.values[0]);
                if (!cmd) return;
                return interaction.reply({ embeds: [base({ titulo: `Comando: ${cmd.data.name}`, campos: [{ name: '📝 O que faz', value: cmd.data.description || 'Sem descrição.' }] })], flags: 64 });
            }
            if (interaction.customId === 'ticket:menu') {
                return require('../modules/tickets').abrirTicket(interaction);
            }
            if (interaction.customId === 'setup:menu') {
                const valor = interaction.values[0];
                if (valor === 'logs') return interaction.reply({ content: '👉 Use o comando `/config setlogs canal:#seu-canal` para configurar.', flags: 64 });
                if (valor === 'tickets') return interaction.reply({ content: '👉 Use o comando `/config setticket cargo_suporte:@cargo` para configurar.', flags: 64 });
                if (valor === 'welcome') return interaction.reply({ content: '👉 Edite o arquivo `config.json` na seção "welcome" para configurar.', flags: 64 });
                if (valor === 'sugestoes') return interaction.reply({ content: '👉 Edite o arquivo `config.json` na seção "sugestoes" para configurar.', flags: 64 });
                if (valor === 'giveaway') return interaction.reply({ content: '👉 Use o comando `/giveaway criar` para começar!', flags: 64 });
            }
            return;
        }

        // 3. Botões
        if (interaction.isButton()) {
            const id = interaction.customId;
            try {
                // Embeds e Tickets
                if (id === 'embed:enviar') { await interaction.channel.send({ embeds: [interaction.message.embeds[0]] }); return interaction.update({ content: '✅ Embed enviado!', embeds: [], components: [] }); }
                if (id === 'embed:cancelar') return interaction.update({ content: '❌ Cancelado.', embeds: [], components: [] });
                if (id === 'ticket:fechar') return require('../modules/tickets').fecharTicket(interaction);

                // Giveaway
                if (id === 'giveaway:participar') {
                    const gw = db.getGiveawayByMessage(interaction.message.id);
                    if (!gw || gw.ended) return interaction.reply({ content: 'Sorteio encerrado.', flags: 64 });
                    const inscritos = db.getEntries(gw.id);
                    if (inscritos.some(i => i.user_id === interaction.user.id)) return interaction.reply({ content: '⚠️ Você já está participando!', flags: 64 });
                    db.enterGiveaway(gw.id, interaction.user.id);
                    return interaction.reply({ content: '✅ Você entrou no sorteio!', flags: 64 });
                }

                // Cargos
                if (id.startsWith('role:')) {
                    const cargo = interaction.guild.roles.cache.get(id.split(':')[1]);
                    if (!cargo) return interaction.reply({ content: 'Cargo não encontrado.', flags: 64 });
                    if (interaction.member.roles.cache.has(cargo.id)) { await interaction.member.roles.remove(cargo); return interaction.reply({ content: `Cargo **${cargo.name}** removido.`, flags: 64 }); }
                    else { await interaction.member.roles.add(cargo); return interaction.reply({ content: `Cargo **${cargo.name}** adicionado!`, flags: 64 }); }
                }

                // Enquete (NOVA ETAPA 4)
                if (id.startsWith('enquete:')) {
                    const optionIndex = parseInt(id.split(':')[1]);
                    const poll = db.getPollByMessage(interaction.message.id);
                    if (!poll) return interaction.reply({ content: 'Enquete não encontrada.', flags: 64 });

                    db.votePoll(poll.id, interaction.user.id, optionIndex);

                    // Atualiza o embed da enquete na mensagem
                    const enqueteModule = require('../commands/social/enquete');
                    const novoEmbed = await enqueteModule.montarEmbedPoll(poll);

                    await interaction.message.edit({ embeds: [novoEmbed] });
                    return interaction.reply({ content: '✅ Seu voto foi registrado!', flags: 64 });
                }

                // Sugestão
                if (id === 'sugestao:up' || id === 'sugestao:down') {
                    const sug = db.getSuggestionByMessage(interaction.message.id);
                    if (!sug) return interaction.reply({ content: 'Sugestão não encontrada.', flags: 64 });
                    const voto = id.endsWith('up') ? 'up' : 'down';
                    const resultado = db.voteSuggestion(sug.id, interaction.user.id, voto);

                    const updatedSug = db.getSuggestionByMessage(interaction.message.id);
                    const autorOriginal = interaction.message.embeds[0].footer.text.includes('Anônimo') ? 'Anônimo' : interaction.message.embeds[0].footer.text.split(': ')[1];

                    const embed = base({ titulo: '💡 Nova Sugestão', descricao: updatedSug.content, rodape: `Enviado por: ${autorOriginal}`, campos: [{ name: 'Votos 👍', value: `${updatedSug.upvotes}`, inline: true }, { name: 'Votos 👎', value: `${updatedSug.downvotes}`, inline: true }] });

                    await interaction.message.edit({ embeds: [embed] });
                    return interaction.reply({ content: resultado.removido ? 'Seu voto foi removido.' : '✅ Voto registrado!', flags: 64 });
                }

            } catch (err) {
                log.error(`Erro no botão ${id}:`, err);
                if (!interaction.replied) interaction.reply({ content: '❌ Erro ao processar.', flags: 64 }).catch(()=>{});
            }
        }
    },
};