# Plano de Melhoria Gradual - Passo 1

O objetivo é adicionar funcionalidades de forma incremental para garantir que a aplicação permaneça estável em cada etapa.

## Passo 1: Categorias e Progresso Básico
Nesta etapa, vamos adicionar:
1.  **Chips de Categoria**: Botões no topo para buscas rápidas (Lo-fi, Jazz, etc).
2.  **Progresso Real**: Fazer a barra de tempo no rodapé mostrar o tempo real da música.

## Alterações Propostas

### [App.jsx](file:///C:/Users/Usuario/Documents/MeuTube/src/App.jsx)
- Adicionar estado `selectedCategory` e a lista de categorias.
- Implementar um `useEffect` simples para atualizar a busca quando uma categoria for clicada.
- Adicionar estado `duration` e `currentTime` com um `setInterval` seguro que verifica se o player existe antes de ler os dados.
- Atualizar o `footer` para usar o `input type="range"` vinculado ao tempo real.

## Verificação
- **Manual**: Clicar em uma categoria e ver se a lista de músicas muda.
- **Manual**: Dar play e observar se o tempo no rodapé avança conforme a música toca.
- **Segurança**: Verificar se o console não apresenta erros de "null pointers" ao trocar de música.
