 <div align="center">

# 🌀 SionixBot

**O bot de Discord open-source para quem nunca programou na vida.**

[![Versão](https://img.shields.io/badge/vers%C3%A3o-2.1.0-blue.svg)](#)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-brightgreen.svg)](https://nodejs.org/)

</div>

---

## E aí, beleza? 👋

O **SionixBot** nasceu de uma ideia simples: **todo mundo merece ter um bot próprio no Discord.**

Muita gente quer um bot com moderação, tickets, sorteios e várias outras coisas, mas não sabe programar ou não tem dinheiro para contratar alguém.

Foi pensando nisso que comecei a desenvolver o SionixBot. A ideia é deixar tudo mais fácil, até para quem nunca escreveu uma linha de código.

Quero que você consiga baixar o projeto, configurar seu bot e colocar ele para funcionar sem precisar quebrar a cabeça com um monte de código complicado.

## ✨ O que ele faz?

- **🛡️ Moderação:** ban, kick, softban, tempban com desbanimento automático, timeout, avisos com punições automáticas, limpeza de mensagens, bloqueio de canais e recriação de canais.
- **🎫 Tickets:** sistema de atendimento com menu de seleção e transcrições em `.txt`.
- **🎉 Diversão:** sorteios persistentes, enquetes, sugestões com votação, AFK, lembretes e recuperação de mensagens recentes.
- **🔒 Segurança:** proteção contra raids, spam, conteúdo indesejado e uso indevido de cargos perigosos.
- **⚙️ Configuração:** comando `/setup` para configurar o bot e `/status` para consultar seu estado.

A ideia é reunir várias ferramentas úteis em um único bot, sem deixar o projeto desnecessariamente pesado ou complicado.

## 🚀 Bora rodar?

Calma, não precisa ser programador para começar! 😅

### 1. Instale o Node.js

Baixe e instale o [Node.js](https://nodejs.org/), versão 20 ou superior.

### 2. Baixe o SionixBot

Abra o terminal e execute:

```bash
git clone https://github.com/SEU-USUARIO/sionixbot.git
cd sionixbot
npm install
```

Troque `SEU-USUARIO` pelo usuário ou pela organização que mantém o repositório.

### 3. Configure seu bot

Copie o arquivo `.env.example` para `.env` e preencha as variáveis necessárias, incluindo o token do bot.

Depois, configure o `config.json`, caso ele faça parte da versão utilizada, ou use o `/setup` se o comando estiver disponível.

Você também precisará criar sua aplicação no [Discord Developer Portal](https://discord.com/developers/applications).

**Importante:** nunca compartilhe seu token nem envie o arquivo `.env` para o GitHub.

### 4. Ligue o bot

No terminal, execute:

```bash
npm start
```

Pronto! Se tudo estiver configurado corretamente, seu bot deverá ficar online. 🌀

> 💡 **Precisa de uma mãozinha?**
>
> Dá uma olhada no [`LEIA-ME.txt`](./LEIA-ME.txt). A ideia é explicar o processo passo a passo, desde a criação do bot no Discord até a configuração e a hospedagem. Assim, você não precisa descobrir tudo sozinho.

## 🛠️ Como ele funciona?

Estas são as tecnologias utilizadas pelo projeto:

- **Node.js:** executa o código JavaScript.
- **discord.js v14:** permite conectar o bot ao Discord.
- **SQLite:** armazena os dados localmente.
- **better-sqlite3:** permite utilizar o SQLite no Node.js.
- **Arquitetura modular:** organiza comandos, eventos e funcionalidades em arquivos separados.

O objetivo é manter o projeto organizado e fácil de entender, sem exigir um servidor de banco de dados separado.

## 🤝 Quer ajudar?

O SionixBot é open-source, então você também pode fazer parte do projeto!

Encontrou um bug? Tem uma ideia legal? Quer melhorar alguma coisa?

Você pode abrir uma *issue* para relatar um problema ou sugerir uma funcionalidade. Se quiser colocar a mão no código, também pode enviar um Pull Request.

Toda contribuição que ajude o projeto a melhorar é bem-vinda. 💙

## 📜 Licença

O SionixBot é distribuído sob a licença **MIT**.

Consulte o arquivo [`LICENSE`](./LICENSE) para conhecer os termos de uso e distribuição.

---

<div align="center">

Feito com 💙 e muito café por **MrJGodzilla**.

*Um projeto feito para aprender, compartilhar e facilitar a vida de quem quer ter seu próprio bot.*

</div>
