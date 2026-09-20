import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Activity,
  Sliders,
  Check
} from 'lucide-react';
import { GeneratedMusicItem } from '../types';
import { synthesizeTrack } from '../utils/audioSynth';

interface MusicGenerationCardProps {
  musicItem: GeneratedMusicItem;
  onRegenerate?: (genre: string, tempo: string) => void;
}

export const MusicGenerationCard: React.FC<MusicGenerationCardProps> = ({
  musicItem,
  onRegenerate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(musicItem.durationSeconds || 18);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [waveform, setWaveform] = useState<number[]>(musicItem.waveform || []);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(musicItem.audioDataUrl);
  const [isSynthesizing, setIsSynthesizing] = useState(!musicItem.audioDataUrl);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sintetizar pista real si no existe audioUrl
  useEffect(() => {
    if (!audioUrl) {
      setIsSynthesizing(true);
      const timer = setTimeout(() => {
        const bpm = parseInt(musicItem.tempo) || 110;
        const result = synthesizeTrack(musicItem.genre, bpm, musicItem.durationSeconds || 18);
        setAudioUrl(result.audioUrl);
        setWaveform(result.waveform);
        setDuration(result.durationSeconds);
        setIsSynthesizing(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [audioUrl, musicItem.genre, musicItem.tempo, musicItem.durationSeconds]);

  // Manejar audio nativo
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio play error', e);
      });
    }
  };

  const handleSeekWaveform = (index: number) => {
    const audio = audioRef.current;
    if (!audio || waveform.length === 0) return;
    const targetRatio = index / waveform.length;
    const targetTime = targetRatio * duration;
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    const sanitizedTitle = (musicItem.title || 'pista_bdr').toLowerCase().replace(/\s+/g, '_');
    link.download = `${sanitizedTitle}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerateAudio = () => {
    setIsSynthesizing(true);
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setTimeout(() => {
      const bpm = parseInt(musicItem.tempo) || 110;
      const result = synthesizeTrack(musicItem.genre, bpm + (Math.random() > 0.5 ? 4 : -4), duration);
      setAudioUrl(result.audioUrl);
      setWaveform(result.waveform);
      setIsSynthesizing(false);
      if (onRegenerate) {
        onRegenerate(musicItem.genre, musicItem.tempo);
      }
    }, 800);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const playheadRatio = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="mt-3 bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs text-xs space-y-4">
      {/* Audio Element nativo invisible */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="auto" />
      )}

      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#059669] text-white flex items-center justify-center shadow-xs">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#141413] text-sm">{musicItem.title || 'Pista de Audio Sintetizada'}</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-semibold">
                Audio WAV 44.1kHz
              </span>
            </div>
            <p className="text-[11px] text-[#5e6d75]">
              Género: <span className="font-medium text-[#141413]">{musicItem.genre}</span> • {musicItem.tempo} • {musicItem.mood}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#e2e8f0] font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Prompt / Descripción */}
      <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0] text-xs">
        <span className="text-[11px] font-semibold text-[#5e6d75] flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3 text-[#0d9488]" />
          Parámetros de síntesis musical:
        </span>
        <p className="text-xs text-[#1e293b] font-medium italic">
          “{musicItem.prompt}”
        </p>
      </div>

      {/* REPRODUCTOR INTERACTIVO CON FORMA DE ONDA (WAVEFORM) */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 sm:p-5 rounded-2xl border border-[#334155] shadow-inner text-white space-y-4">
        {/* Contenedor de forma de onda */}
        <div className="relative pt-2 pb-1">
          {isSynthesizing ? (
            <div className="h-20 flex flex-col items-center justify-center space-y-2 text-white/70">
              <div className="w-6 h-6 border-2 border-white/20 border-t-[#2dd4bf] rounded-full animate-spin" />
              <span className="text-[11px] font-medium">Sintetizando acordes polifónicos y frecuencias...</span>
            </div>
          ) : (
            <div className="h-20 flex items-center justify-between gap-[3px] sm:gap-1.5 px-2 cursor-pointer group">
              {waveform.map((barHeight, idx) => {
                const barRatio = idx / waveform.length;
                const isPassed = barRatio <= playheadRatio;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSeekWaveform(idx)}
                    className="flex-1 flex items-center justify-center h-full group/bar"
                    title={`Saltar a ${formatTime(barRatio * duration)}`}
                  >
                    <div
                      className={`w-full rounded-full transition-all duration-150 ${
                        isPassed
                          ? 'bg-[#2dd4bf] shadow-[0_0_8px_rgba(45,212,191,0.6)]'
                          : 'bg-white/25 group-hover/bar:bg-white/50'
                      }`}
                      style={{
                        height: `${Math.max(12, barHeight * 100)}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Barra de Controles de Reproducción */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-white/90">
          <div className="flex items-center gap-3">
            {/* Botón Play / Pause */}
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isSynthesizing || !audioUrl}
              className="w-10 h-10 rounded-full bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] flex items-center justify-center font-bold transition shadow-md cursor-pointer disabled:opacity-50"
              title={isPlaying ? 'Pausar reproducción' : 'Iniciar reproducción'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              )}
            </button>

            <div className="text-xs font-mono font-medium">
              <span className="text-[#2dd4bf]">{formatTime(currentTime)}</span>
              <span className="text-white/40"> / {formatTime(duration)}</span>
            </div>
          </div>

          {/* Control de Volumen */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white/60 hover:text-white transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 sm:w-20 accent-[#2dd4bf] cursor-pointer"
              title="Volumen"
            />
          </div>
        </div>
      </div>

      {/* Botones de acción inferiores */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="text-[11px] text-[#5e6d75] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>Sintetizador Web Audio API • 16-bit PCM • Libre de regalías</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegenerateAudio}
            disabled={isSynthesizing}
            className="px-3 py-1.5 rounded-xl border border-[#cbd5e1] hover:border-[#0d9488] bg-white text-[#141413] hover:text-[#0d9488] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerar melodía</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isSynthesizing || !audioUrl}
            className="px-3.5 py-1.5 rounded-xl bg-[#2a7b9b] hover:bg-[#1f5f78] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar WAV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
