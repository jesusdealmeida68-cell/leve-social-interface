# Visualizações e verificações reais

## Objetivo
- Substituir a ação “Adoro/Curtir” por visualizações nas publicações.
- Tornar a verificação de contacto por código realmente funcional.
- Tornar a atribuição do selo de conta funcional e segura na administração.

## Alterações
1. **Publicações**
   - Mostrar o contador de visualizações no lugar dos gostos.
   - Registar uma visualização ao abrir uma publicação, evitando repetições durante a mesma sessão.
   - Manter comentários como interação disponível.

2. **Verificação de contacto**
   - Ler o estado real da conta.
   - Permitir ao utilizador inserir o código de seis dígitos disponibilizado pelo administrador.
   - Confirmar o código no banco de dados e atualizar imediatamente o aviso e o perfil.
   - No painel administrativo, listar contas reais, copiar ou gerar novo código e alterar o estado de contacto.

3. **Selo de conta**
   - Mostrar o selo junto ao nome nas publicações, perfis, mensagens e pesquisas.
   - Permitir apenas a administradores atribuir ou retirar o selo.
   - Separar a permissão de administrador dos dados públicos do perfil.

4. **Segurança e acabamento**
   - Proteger a página administrativa e todas as ações administrativas.
   - Adicionar carregamento, estados vazios, mensagens de sucesso e erros claros.
   - Validar os fluxos no telemóvel e no computador.

## Detalhes técnicos
- Será aplicada uma migração aditiva para criar funções seguras de visualização e uma tabela separada de funções administrativas.
- Os campos antigos serão mantidos apenas por compatibilidade, sem serem usados para autorização.
- A interface deixará de usar contas fictícias no painel administrativo.
