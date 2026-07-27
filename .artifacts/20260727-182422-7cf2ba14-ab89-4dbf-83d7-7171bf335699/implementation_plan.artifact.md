# Plano de Melhoria Gradual - Autoplay Inteligente

Vamos implementar a funcionalidade de reprodução contínua para que a música nunca pare.

## Passo: Autoplay e Fila
1.  **Lógica de Próximo**: Quando uma música terminar, o app deve decidir o que tocar em seguida.
2.  **Prioridade**:
    *   Próxima música na lista de resultados atual.
    *   Se for a última da lista, toca a primeira das "Sugestões".
    *   Se não houver sugestões, volta ao topo da lista atual.

## Alterações Propostas

### [App.jsx](file:///C:/Users/Usuario/Documents/MeuTube/src/App.jsx)
- Refinar a função `handleNext` para ser mais inteligente.
- Garantir que o evento `onStateChange` (quando o YouTube avisa que o vídeo acabou) chame corretamente essa nova lógica.
- Adicionar tratamento de erro para pular automaticamente caso um vídeo da fila esteja bloqueado.

## Verificação
- **Manual**: Deixar uma música chegar ao fim e observar se a próxima começa sozinha.
- **Manual**: Testar o botão "Próximo" na HUD para ver se segue a mesma lógica.
