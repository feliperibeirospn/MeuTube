import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, SkipForward, SkipBack, ListMusic, History as HistoryIcon, Sparkles } from 'lucide-react';
import { searchMusic, getRelatedVideos } from './services/youtube';

function App() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history') || '[]'));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Lo-fi');

  const categories = ['Lo-fi', 'Synthwave', 'Jazz', 'Chill', 'Gaming', 'Rock', 'Pop'];

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const fetchBySelected = async () => {
      const results = await searchMusic(selectedCategory);
      setVideos(results);
    };
    fetchBySelected();
  }, [selectedCategory]);

  useEffect(() => {
    if (currentVideo) {
      const fetchRelated = async () => {
        const results = await getRelatedVideos(currentVideo.title);
        setRelatedVideos(results.filter(v => v.id !== currentVideo.id));
      };
      fetchRelated();
    }
  }, [currentVideo]);

  useEffect(() => {
    let interval;
    if (isPlaying && player && isPlayerReady) {
      interval = setInterval(() => {
        try {
          if (player && typeof player.getCurrentTime === 'function') {
            setCurrentTime(player.getCurrentTime());
            setDuration(player.getDuration());
          }
        } catch (e) {}
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player, isPlayerReady]);

  useEffect(() => {
    let newPlayer = null;
    const createPlayer = () => {
      if (window.YT && window.YT.Player && document.getElementById('youtube-player')) {
        try {
          newPlayer = new window.YT.Player('youtube-player', {
            height: '0', width: '0',
            playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0, origin: window.location.origin },
            events: {
              onReady: () => setIsPlayerReady(true),
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
                if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
                if (event.data === window.YT.PlayerState.ENDED) handleNext();
              },
              onError: (e) => console.log("YT Error:", e.data)
            },
          });
          setPlayer(newPlayer);
        } catch (err) {}
      }
    };
    if (!window.YT || !window.YT.Player) {
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }
    return () => {
      if (newPlayer && typeof newPlayer.destroy === 'function') {
        try { newPlayer.destroy(); } catch (e) {}
      }
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    const results = await searchMusic(query);
    setVideos(results);
    setSelectedCategory('');
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (player && isPlayerReady && typeof player.seekTo === 'function') {
      try { player.seekTo(newTime); } catch(e) {}
    }
  };

  const playVideo = (video) => {
    setCurrentVideo(video);
    setTimeout(() => {
      if (player && isPlayerReady && typeof player.loadVideoById === 'function') {
        try {
          player.loadVideoById(video.id);
          player.playVideo();
          setIsPlaying(true);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new window.MediaMetadata({
              title: video.title, artist: video.channel,
              artwork: [{ src: video.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
            });
            navigator.mediaSession.setActionHandler('play', () => {
              if (player && typeof player.playVideo === 'function') player.playVideo();
              setIsPlaying(true);
            });
            navigator.mediaSession.setActionHandler('pause', () => {
              if (player && typeof player.pauseVideo === 'function') player.pauseVideo();
              setIsPlaying(false);
            });
            navigator.mediaSession.setActionHandler('nexttrack', handleNext);
          }
        } catch (err) {}
      }
    }, 100);
    setHistory(prev => [video, ...prev.filter(v => v.id !== video.id)].slice(0, 20));
  };

  const togglePlay = () => {
    if (!player || !isPlayerReady) return;
    try {
      if (isPlaying) {
        if (typeof player.pauseVideo === 'function') player.pauseVideo();
      } else {
        if (typeof player.playVideo === 'function') player.playVideo();
      }
      setIsPlaying(!isPlaying);
    } catch (e) {}
  };

  const handleNext = () => {
    // 1. Tenta achar na lista principal de vídeos
    const mainIndex = videos.findIndex(v => v.id === currentVideo?.id);
    if (mainIndex !== -1 && mainIndex < videos.length - 1) {
      playVideo(videos[mainIndex + 1]);
      return;
    }

    // 2. Se não achou ou era o último, tenta na lista de relacionados
    const relatedIndex = relatedVideos.findIndex(v => v.id === currentVideo?.id);
    if (relatedIndex !== -1 && relatedIndex < relatedVideos.length - 1) {
      playVideo(relatedVideos[relatedIndex + 1]);
      return;
    } else if (relatedVideos.length > 0 && mainIndex === videos.length - 1) {
      // Se acabou a lista principal, começa a de relacionados
      playVideo(relatedVideos[0]);
      return;
    }

    // 3. Fallback: volta ao início da lista principal
    if (videos.length > 0) {
      playVideo(videos[0]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-white overflow-hidden font-sans">
      <header className="p-4 bg-gradient-to-b from-zinc-900 to-black sticky top-0 z-10">
        <div className="flex flex-col gap-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="w-full bg-[#242424] hover:bg-[#2a2a2a] transition-colors py-3 px-12 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-zinc-500"
                  placeholder="O que você quer ouvir?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-3 text-zinc-400" size={20} />
              </form>
            </div>
            <div className="w-10 h-10 rounded-full bg-spotify flex items-center justify-center text-black font-bold text-xs shadow-lg">FT</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
        <div className="max-w-6xl mx-auto">
          {videos.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Destaques para você</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {videos.map(video => (
                  <div key={video.id} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 cursor-pointer group shadow-lg" onClick={() => playVideo(video)}>
                    <div className="relative mb-4">
                      <img src={video.thumbnail} alt={video.title} className="w-full aspect-square object-cover rounded-lg shadow-2xl" />
                      <button className="absolute bottom-2 right-2 bg-spotify text-black p-3 rounded-full shadow-2xl translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Play size={20} fill="black" />
                      </button>
                    </div>
                    <h3 className="font-bold text-sm mb-1 truncate">{video.title}</h3>
                    <p className="text-xs text-zinc-400 truncate">{video.channel}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500 space-y-4">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center animate-pulse">
                <ListMusic size={40} className="text-zinc-700" />
              </div>
              <h3 className="text-white font-bold text-lg">Buscando tracks...</h3>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <HistoryIcon size={24} className="text-spotify" /> Tocadas recentemente
              </h2>
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                {history.map(video => (
                  <div key={video.id} className="min-w-[160px] max-w-[160px] snap-start cursor-pointer group" onClick={() => playVideo(video)}>
                    <img src={video.thumbnail} alt={video.title} className="w-full aspect-square object-cover rounded-lg mb-3 shadow-md" />
                    <p className="text-xs font-bold truncate">{video.title}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{video.channel}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatedVideos.length > 0 && (
            <div className="mt-12 pb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Sparkles size={24} className="text-spotify" /> Sugestões baseadas no seu estilo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedVideos.map(video => (
                  <div key={video.id} className="flex items-center gap-4 bg-[#181818]/50 p-2 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group" onClick={() => playVideo(video)}>
                    <img src={video.thumbnail} alt={video.title} className="w-20 aspect-video object-cover rounded shadow-md" />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold truncate group-hover:text-spotify transition-colors">{video.title}</h4>
                      <p className="text-xs text-zinc-400">{video.channel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <div id="youtube-player"></div>

      {currentVideo && (
        <footer className="fixed bottom-0 left-0 right-0 bg-[#000000] border-t border-zinc-900 px-4 py-3 flex items-center justify-between z-50 backdrop-blur-md bg-opacity-95">
          <div className="flex items-center gap-4 w-[30%] min-w-0">
            <img src={currentVideo.thumbnail} alt="" className="w-14 h-14 rounded-md shadow-2xl flex-shrink-0 object-cover" />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold truncate hover:underline cursor-pointer">{currentVideo.title}</h4>
              <p className="text-[11px] text-zinc-400 hover:text-white transition-colors truncate">{currentVideo.channel}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 w-[40%]">
            <div className="flex items-center gap-6">
              <button className="text-zinc-400 hover:text-white transition-colors"><SkipBack size={20} fill="currentColor" /></button>
              <button onClick={togglePlay} className="bg-white text-black p-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg">
                {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
              </button>
              <button onClick={handleNext} className="text-zinc-400 hover:text-white transition-colors"><SkipForward size={20} fill="currentColor" /></button>
            </div>
            <div className="hidden md:flex items-center gap-3 w-full max-w-md">
              <span className="text-[10px] text-zinc-500 w-10 text-right">{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 0} value={currentTime || 0} onChange={handleProgressChange} className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-white hover:accent-spotify transition-all" />
              <span className="text-[10px] text-zinc-500 w-10">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="w-[30%] flex justify-end items-center gap-4">
            <div className="hidden md:flex items-center gap-2 w-32 group">
              <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-spotify w-2/3"></div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
