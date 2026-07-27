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

    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channel: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error("Erro ao buscar no YouTube:", error);
    return [];
  }
};
