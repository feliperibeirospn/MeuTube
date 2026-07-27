const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchMusic = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=20&q=${encodeURIComponent(
        query
      )}&type=video&videoCategoryId=10&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("Erro da API do YouTube:", data.error.message);
      // Opcional: mostrar um alerta para o usuário
      // alert(`Erro: ${data.error.message}`);
      return [];
    }

    if (!data.items) return [];

    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channel: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }
};

export const getRelatedVideos = async (videoTitle) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=10&q=${encodeURIComponent(
        videoTitle
      )}&type=video&videoCategoryId=10&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.error || !data.items) return [];

    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channel: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error("Erro ao buscar relacionados:", error);
    return [];
  }
};
