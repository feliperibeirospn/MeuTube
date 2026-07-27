import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, SkipForward, SkipBack, ListMusic, History as HistoryIcon } from 'lucide-react';
import { searchMusic } from './services/youtube';

function App() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history') || '[]'));

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  // YouTube IFrame API initialization
  useEffect(() => {
    // Função para criar o player
    const createPlayer = () => {
      if (window.YT && window.YT.Player) {
        const newPlayer = new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          playerVars: {
            autoplay: 0,
            controls: 0,
          },
          events: {
            onReady: () => setIsPlayerReady(true),
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
              if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
              if (event.data === window.YT.PlayerState.ENDED) handleNext();
            },
            onError: (e) => console.error("Erro no Player:", e.data)
          },
        });
        setPlayer(newPlayer);
      }
    };

    if (!window.YT) {
      // Se não existe, espera o script carregar (index.html já tem o script)
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      // Se já existe (ex: hot reload), cria direto
      createPlayer();
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    const results = await searchMusic(query);
    setVideos(results);
  };

  const playVideo = (video) => {
    setCurrentVideo(video);
    if (player && isPlayerReady) {
      try {
        player.loadVideoById(video.id);
        setIsPlaying(true);
      } catch (err) {
        console.error("Erro ao carregar vídeo:", err);
      }
    }

    // Add to history
    setHistory(prev => [video, ...prev.filter(v => v.id !== video.id)].slice(0, 20));
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    // Basic logic for next: play next in the current list
    const index = videos.findIndex(v => v.id === currentVideo?.id);
    if (index !== -1 && index < videos.length - 1) {
      playVideo(videos[index + 1]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Search Header */}
      <header className="p-4 bg-dark">
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
          <input
            type="text"
            className="w-full bg-light py-2 px-10 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify"
            placeholder="O que você quer ouvir?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {videos.map(video => (
              <div
                key={video.id}
                className="bg-light p-3 rounded-lg hover:bg-zinc-800 transition cursor-pointer group"
                onClick={() => playVideo(video)}
              >
                <img src={video.thumbnail} alt={video.title} className="w-full aspect-square object-cover rounded-md mb-2 shadow-lg" />
                <h3 className="font-bold text-sm truncate">{video.title}</h3>
                <p className="text-xs text-gray-400 truncate">{video.channel}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ListMusic size={64} className="mb-4" />
            <p>Busque por músicas Lo-Fi, Synthwave...</p>
          </div>
        )}

        {/* Historico Section */}
        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <HistoryIcon size={20} /> Histórico
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {history.map(video => (
                <div key={video.id} className="min-w-[150px] cursor-pointer" onClick={() => playVideo(video)}>
                  <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover rounded-md mb-1" />
                  <p className="text-xs font-medium truncate">{video.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Hidden Player Element */}
      <div id="youtube-player"></div>

      {/* Bottom Player Controls */}
      {currentVideo && (
        <footer className="fixed bottom-0 left-0 right-0 bg-dark border-t border-zinc-800 p-3 flex items-center justify-between z-50">
          <div className="flex items-center gap-3 w-1/3">
            <img src={currentVideo.thumbnail} alt="" className="w-12 h-12 rounded shadow-md" />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold truncate">{currentVideo.title}</h4>
              <p className="text-xs text-gray-400 truncate">{currentVideo.channel}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 w-1/3">
            <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-white"><SkipBack size={24} /></button>
              <button
                onClick={togglePlay}
                className="bg-white text-black p-2 rounded-full hover:scale-105 transition"
              >
                {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
              </button>
              <button onClick={handleNext} className="text-gray-400 hover:text-white"><SkipForward size={24} /></button>
            </div>
          </div>

          <div className="w-1/3 flex justify-end">
            {/* Volume control could go here */}
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
