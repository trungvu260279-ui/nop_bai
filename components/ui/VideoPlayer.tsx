import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertTriangle } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  const togglePlay = () => {
    if (videoRef.current && !hasError) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (!isNaN(total) && total > 0) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setHasError(false);
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasError) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
      if (newMutedState) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (hasError) {
    return (
      <div className="w-full aspect-video bg-slate-900 flex flex-col items-center justify-center text-slate-400 border border-slate-800 rounded-xl relative group overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center p-6 text-center">
             <AlertTriangle className="w-12 h-12 mb-4 text-red-500 opacity-80" />
             <h3 className="text-slate-200 font-semibold mb-2">Video Unavailable</h3>
             <p className="text-sm text-slate-500 mb-4">The video source could not be loaded.</p>
             <p className="text-xs text-slate-600 font-mono bg-slate-950/50 px-3 py-1.5 rounded-md border border-slate-800/50 max-w-[250px] truncate">
                {src}
             </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black ring-1 ring-white/10">
      {/* Poster Image (Only visible when not playing and progress is 0) */}
      {!isPlaying && progress === 0 && (
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay}>
            <img 
                src={poster} 
                alt={title} 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x450?text=No+Poster';
                }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-lg group-hover:scale-110 group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-300">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
            </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto aspect-video cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
      />

      {/* Custom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-4 px-4 transition-all duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-3 group/progress">
           <span className="text-xs font-medium text-slate-300 w-10">{formatTime(videoRef.current?.currentTime || 0)}</span>
           <div className="relative flex-1 h-1 bg-white/20 rounded-full cursor-pointer group-hover/progress:h-1.5 transition-all">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div 
                    className="absolute top-0 left-0 h-full bg-red-600 rounded-full pointer-events-none transition-all"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform"></div>
                </div>
           </div>
           <span className="text-xs font-medium text-slate-300 w-10 text-right">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors transform hover:scale-110">
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                
                <div className="flex items-center gap-3 group/vol">
                    <button onClick={toggleMute} className="text-white hover:text-red-500 transition-colors">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div className="w-0 group-hover/vol:w-20 transition-all duration-300 overflow-hidden">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                </div>
            </div>

            <h3 className="text-white/90 text-sm font-medium hidden sm:block truncate max-w-[200px] drop-shadow-md select-none">{title}</h3>

            <button onClick={toggleFullScreen} className="text-white hover:text-red-500 transition-colors transform hover:scale-110">
                <Maximize size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;