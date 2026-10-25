const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { base, erro } = require('../../core/embed');

module.exports = {
    categoria: 'Config', exemplo: '/rolebutton',
    data: new SlashCommandBuilder().setName('rolebutton').setDescription('Cria um botão para dar/remover cargo').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true)).addStringOption(o => o.setName('texto').setDescription('Texto do botão').setRequired(true)),
    async execute({ interaction, isSlash }) {
        if (!isSlash) return;
        const cargo = interaction.options.getRole('cargo');
        const texto = interaction.options.getString('texto');

        // Verifica cargo perigoso
        if (cargo.managed || cargo.permissions.has(PermissionFlagsBits.Administrator) || cargo.permissions.has(PermissionFlagsBits.ManageGuild) || cargo.permissions.has(PermissionFlagsBits.ManageRoles) || cargo.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ embeds: [erro('Por segurança, não posso criar um botão para cargos com permissões administrativas ou gerenciados.')], flags: 64 });
        }

        // Verifica hierarquia (o cargo do bot precisa ser maior)
        if (cargo.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [erro('Eu não posso dar esse cargo porque ele está acima de mim na hierarquia. Suba meu cargo!')], flags: 64 });
        }

        const embed = base({ titulo: 'Pegue seu cargo', descricao: `Clique abaixo para pegar o cargo **${cargo.name}**.` });
        const botao = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`role:${cargo.id}`).setLabel(texto).setStyle(ButtonStyle.Primary));

        await interaction.channel.send({ embeds: [embed], components: [botao] });
        await interaction.reply({ content: '✅ Painel criado!', flags: 64 });
    },
};