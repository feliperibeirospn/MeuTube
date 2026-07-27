# MeuTube Music Player (PWA)

Um player de música minimalista que consome a API do YouTube, focado em portfólio.

## 🚀 Como rodar o projeto

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Configure a API Key:**
    - Vá até o arquivo `src/services/youtube.js`.
    - Substitua `'YOUR_YOUTUBE_API_KEY'` pela sua chave gerada no [Google Cloud Console](https://console.cloud.google.com/).

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Para testar como PWA no celular:**
    - Você precisará de uma conexão segura (HTTPS). Você pode usar o [ngrok](https://ngrok.com/) para expor seu localhost ou fazer deploy em plataformas como Vercel ou Netlify.
    - No Chrome/Safari do celular, acesse a URL e selecione "Adicionar à Tela de Início".

## 🛠 Tecnologias
- **React** + **Vite**
- **Tailwind CSS** (Estilização dark mode)
- **Lucide React** (Ícones)
- **Vite PWA Plugin** (Transforma em App instalável)
- **YouTube IFrame API** (Controle de áudio/vídeo)

## 📂 Estrutura
- `src/services/youtube.js`: Integração com a YouTube Data API v3.
- `src/App.jsx`: UI principal e lógica do player.
- `src/index.css`: Estilos globais e customização de componentes.
