# Plano de Melhoria Gradual - Passo 2

O foco agora é aumentar o tempo de retenção do usuário no app através de sugestões inteligentes, sem usar funções depreciadas da API.

## Passo 2: Sugestões e Refinamento
Nesta etapa, vamos adicionar:
1.  **Sugestões Inteligentes**: Uma lista de músicas relacionadas à que está tocando agora.
2.  **Lógica de Busca Segura**: Usaremos o título da música atual para buscar "relacionados", evitando o erro 400.

## Alterações Propostas

### [youtube.js](file:///C:/Users/Usuario/Documents/MeuTube/src/services/youtube.js)
- Adicionar a função `getRelatedVideos(videoTitle)` que realiza uma busca comum filtrada pela categoria de música.

### [App.jsx](file:///C:/Users/Usuario/Documents/MeuTube/src/App.jsx)
- Adicionar o estado `relatedVideos`.
- Criar um `useEffect` que dispara a busca de relacionados sempre que `currentVideo` mudar.
- Adicionar uma nova seção na UI (abaixo ou ao lado do conteúdo principal) para exibir essas sugestões com um layout compacto.

## Verificação
- **Manual**: Ao tocar uma música, verificar se a seção "Sugestões para você" aparece com novas músicas.
- **Manual**: Clicar em uma sugestão e ver se o player troca de música e carrega novas sugestões para ela.
