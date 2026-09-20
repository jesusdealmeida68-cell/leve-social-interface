# Leve Social Interface

Crie um protótipo VISUAL completo de uma rede social chamada LEVE, voltada para conteúdo digital. O objetivo nesta etapa é criar SOMENTE a interface visual e a navegação simulada. Não criar backend, banco de dados, autenticação real, pagamentos, upload real ou qualquer funcionalidade que exija servidor.

ESTILO GERAL

- Interface moderna, elegante e minimalista.
- Tema totalmente escuro.
- Inspiração estrutural em redes sociais modernas como o X atingir Twitter: feed central, navegação lateral no desktop e barra inferior no mobile.
- NÃO copiar o logotipo, ícones, textos, identidade visual ou design proprietário do X.
- Criar identidade visual própria para o LEVE.
- Fundo preto/cinza muito escuro.
- Cartões e áreas de conteúdo com pequenas diferenças de tonalidade para criar hierarquia.
- Tipografia moderna e muito legível.
- Bordas discretas.
- Animações suaves de hover, transição e abertura de páginas.
- Layout responsivo para computador e telemóvel.

ESTRUTURA PRINCIPAL

O site terá somente estas 4 áreas principais:

1. Feed
2. Mensagens
3. História
4. Perfil

Não criar Store, Comunidades, Grupos, Marketplace ou outras áreas.

---

1. FEED

Criar a página inicial do LEVE.

No desktop:

- Barra lateral esquerda com o logotipo LEVE.
- Item "Feed" selecionado.
- "Mensagens"
- "História"
- "Perfil"
- Botão principal para criar publicação.
- Área central com o feed.
- Área direita pequena para sugestões e informações.

No mobile:

- Cabeçalho com o logotipo LEVE.
- Feed ocupando praticamente toda a largura.
- Navegação fixa igual no pc.

Feed

No topo do feed:

- Campo de pesquisa.
- Ícone de notificações.
- Área horizontal de Histórias.

Criar cards de publicação com:

- Avatar
- @username
- botão Seguir
- menu de três pontos
- imagem ou vídeo de demonstração
- botão Curtir
- botão Comentários
- botão Compartilhar
- contador de interações
- descrição
- data da publicação

Usar conteúdos fictícios apenas para demonstrar o visual.

Não utilizar conteúdo sexual explícito nas imagens de demonstração. Utilizar imagens neutras/de modelo, silhuetas ou placeholders elegantes.

---

2. MENSAGENS

Criar uma página de mensagens com aparência moderna.

Desktop:

- Coluna esquerda com lista de conversas.
- Área central com a conversa aberta.
- Pesquisa de conversas no topo.

Cada conversa deve mostrar:

- Avatar
- Nome
- @username
- última mensagem
- horário
- indicador de mensagens não lidas.

Ao abrir uma conversa:

- Cabeçalho com avatar e nome.
- Área de mensagens.
- Campo "Escrever mensagem..."
- Botão de enviar.
- Ícone para anexar.
- Menu de opções.

No mobile:

- Mostrar primeiro a lista de conversas.
- Ao abrir uma conversa, ocupar a tela inteira.
- Botão voltar no topo.

---

3. HISTÓRIA

Criar uma área própria para conteúdos temporários de 24 horas.

No Feed, mostrar uma faixa horizontal de Histórias:

- "Sua história"
- Avatares de outros utilizadores.
- Indicador circular ao redor do avatar.

Ao clicar em uma história:

- Abrir visualização em tela cheia.
- Fundo escuro.
- Barra de progresso no topo.
- Avatar e nome do utilizador.
- Botão fechar.
- Botões de avançar e voltar.
- Campo para responder.
- Indicador de visualização.

Criar também a interface para adicionar uma nova História:

- Escolher foto
- Escolher vídeo
- Adicionar texto
- Publicar

Como é apenas um protótipo, esses controles podem ser simulados.

---

4. PERFIL

Criar uma página de perfil semelhante à estrutura de uma rede social moderna.

Mostrar:

- Foto de perfil
- Nome
- @username
- Biografia
- Seguidores
- Seguindo
- Botão Editar perfil
- Botão Compartilhar perfil
- Área de publicações

Criar uma grelha de conteúdos no perfil.

No desktop, usar uma estrutura ampla.

No mobile, usar uma grelha de 3 colunas.

Ao clicar em uma publicação, abrir uma visualização detalhada.

---

NAVEGAÇÃO

No desktop:

LEVE

- Feed
- Mensagens
- História
- Perfil

No mobile, criar uma barra mesma coisa

Usar ícones simples e modernos.

---

RESPONSIVIDADE

O protótipo deve funcionar visualmente em:

- Android
- iPhone
- Tablet
- Desktop

No telemóvel, priorizar o feed e utilizar navegação inferior.

No desktop, utilizar layout de três áreas:

Navegação esquerda | Feed central | Área auxiliar direita

---

IDENTIDADE VISUAL

Nome:

LEVE

Criar um logotipo tipográfico simples e moderno.

Não utilizar câmera como símbolo obrigatório.

Criar uma identidade visual própria, sofisticada e minimalista.

Tema:

Dark / Black

A interface deve parecer uma plataforma social moderna e profissional, não um painel administrativo.

---

IMPORTANTE

Este projeto é SOMENTE um protótipo visual.

Não implementar:

- Banco de dados
- Supabase
- Login real
- Cadastro real
- Pagamentos
- Sistema real de mensagens
- Upload real
- Sistema real de seguidores
- Algoritmo
- Moderação automática
- APIs
- Backend

Pode utilizar dados fictícios exclusivamente para preencher a interface e demonstrar como o produto ficará.

O resultado final deve parecer uma rede social real e pronta para apresentação, mas todas as ações podem ser apenas simuladas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7f908bb9-640f-423f-92ce-51fb33421f31).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
