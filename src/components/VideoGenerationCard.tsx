import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { GeneratedVideoItem } from '../types';

interface VideoGenerationCardProps {
  videoItem: GeneratedVideoItem;
  onRegenerate?: (prompt: string) => void;
}

export const VideoGenerationCard: React.FC<VideoGenerationCardProps> = ({
  videoItem,
  onRegenerate,
}) => {
  const [status, setStatus] = useState<GeneratedVideoItem['status']>(videoItem.status);
  const [progress, setProgress] = useState<number>(videoItem.status === 'ready' ? 100 : 20);
  const [stageText, setStageText] = useState<string>(
    videoItem.status === 'ready' ? 'Vídeo renderizado con éxito' : 'En cola de procesamiento...'
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(videoItem.durationSeconds || 6);

  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Simulación del ciclo de procesamiento asíncrono si entra en processing / queued
  useEffect(() => {
    if (status !== 'ready') {
      const step1 = setTimeout(() => {
        setStatus('processing');
        setProgress(45);
        setStageText('Generando fotogramas clave y flujo de cámara...');
      }, 800);

      const step2 = setTimeout(() => {
        setStatus('rendering');
        setProgress(78);
        setStageText('Interpolación temporal a 60 FPS y reducción de artefactos...');
      }, 1600);

      const step3 = setTimeout(() => {
        setStatus('ready');
        setProgress(100);
        setStageText('Vídeo renderizado con éxito (H.264 / 1080p)');
      }, 2400);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
      };
    }
  }, [status]);

  // Reproductor visual nativo en Canvas con animación de fotogramas fluida en bucle
  useEffect(() => {
    if (status !== 'ready') return;
    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();
    const totalDurationMs = duration * 1000;

    const renderFrame = (now: number) => {
      if (!isPlaying) {
        animFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const elapsed = (now - startTime) % totalDurationMs;
      const progressRatio = elapsed / totalDurationMs;
      setCurrentTime(parseFloat((progressRatio * duration).toFixed(1)));

      const w = canvas.width;
      const h = canvas.height;

      // Dibujar fondo cinematográfico dinámico
      const grad = ctx.createRadialGradient(
        w / 2 + Math.sin(progressRatio * Math.PI * 2) * 100,
        h / 2 + Math.cos(progressRatio * Math.PI * 2) * 60,
        20,
        w / 2,
        h / 2,
        w * 0.75
      );
      grad.addColorStop(0, '#1e3e4f');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Elementos cinéticos en movimiento (simulación de flujo de partículas y planos 3D)
      const numElements = 16;
      for (let i = 0; i < numElements; i++) {
        const offset = i * (Math.PI * 2 / numElements);
        const orbitRadius = 90 + Math.sin(progressRatio * Math.PI * 4 + i) * 35;
        const x = w / 2 + Math.cos(progressRatio * Math.PI * 2 + offset) * (orbitRadius + i * 8);
        const y = h / 2 + Math.sin(progressRatio * Math.PI * 2 + offset) * (orbitRadius * 0.6 + i * 4);
        const size = 18 + Math.sin(progressRatio * Math.PI * 6 + i) * 8;

        const pGrad = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
        pGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
        pGrad.addColorStop(1, 'rgba(42, 123, 155, 0.4)');
        ctx.fillStyle = pGrad;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(3, size), 0, Math.PI * 2);
        ctx.fill();

        // Estelas luminosas
        ctx.strokeStyle = 'rgba(220, 240, 250, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Cuadrícula cinemática sutil de perspectiva
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const horizonY = h * 0.65;
      for (let x = 0; x < w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(w / 2, horizonY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Overlay de tiempo y código de tiempo en esquina
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(16, 16, 90, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      const tc = `00:0${Math.floor(currentTime)}:00`;
      ctx.fillText(tc, 26, 32);

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [status, isPlaying, duration, currentTime]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDownloadVideo = () => {
    // Generar archivo de vídeo simulado o descargar fotograma de captura
    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `bdr_video_capture_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRegenerate = () => {
    setStatus('queued');
    setProgress(15);
    setStageText('Iniciando nueva secuencia de renderizado...');
    setIsPlaying(false);
    setCurrentTime(0);
    if (onRegenerate) {
      onRegenerate(videoItem.prompt);
    }
  };

  return (
    <div className="mt-3 bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs text-xs space-y-4">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#2563eb] text-white flex items-center justify-center shadow-xs">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#141413] text-sm">Generación de Vídeo IA</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                status === 'ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800 animate-pulse'
              }`}>
                {status === 'ready' ? 'Completado' : 'Procesando vídeo...'}
              </span>
            </div>
            <p className="text-[11px] text-[#5e6d75]">
              Formato: <span className="font-medium text-[#141413]">1080p • 60 FPS • {duration}s</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#e2e8f0]">
          <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
          <span>{currentTime}s / {duration}s</span>
        </div>
      </div>

      {/* Prompt del vídeo */}
      <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0] text-xs">
        <span className="text-[11px] font-semibold text-[#5e6d75] flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3 text-[#0284c7]" />
          Prompt cinemático:
        </span>
        <p className="text-xs text-[#1e293b] font-medium italic">
          “{videoItem.prompt}”
        </p>
      </div>

      {/* Contenedor del Reproductor de Vídeo */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0a0d14] border border-[#cbd5e1] aspect-video flex items-center justify-center group shadow-md">
        {/* Overlay de procesamiento asíncrono */}
        {status !== 'ready' && (
          <div className="absolute inset-0 bg-[#0a0d14]/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
            <div className="w-12 h-12 rounded-full border-3 border-white/20 border-t-[#38bdf8] animate-spin" />
            <div>
              <p className="text-white font-semibold text-xs">{stageText}</p>
              <p className="text-white/50 text-[11px] mt-0.5">{progress}% completado</p>
            </div>
            <div className="w-56 bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#38bdf8] to-[#2563eb] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Canvas del reproductor con animación fluida */}
        <canvas
          ref={videoCanvasRef}
          width={854}
          height={480}
          className="w-full h-full object-cover cursor-pointer"
          onClick={handleTogglePlay}
        />

        {/* Botón central de Play si está pausado */}
        {status === 'ready' && !isPlaying && (
          <button
            type="button"
            onClick={handleTogglePlay}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition transform hover:scale-105 cursor-pointer z-10"
            title="Reproducir vídeo"
          >
            <Play className="w-6 h-6 ml-0.5 fill-white text-white" />
          </button>
        )}

        {/* Barra de control inferior embebida en el reproductor */}
        {status === 'ready' && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-1.5 z-10 opacity-90 group-hover:opacity-100 transition">
            {/* Timeline interactiva */}
            <div className="w-full bg-white/30 hover:bg-white/40 h-1.5 rounded-full overflow-hidden cursor-pointer">
              <div
                className="bg-[#38bdf8] h-full rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-white text-[11px] pt-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="hover:text-[#38bdf8] transition cursor-pointer"
                  title={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <span>{currentTime.toFixed(1)}s / {duration}.0s</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-[#38bdf8] transition cursor-pointer"
                  title={isMuted ? 'Activar audio' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción inferiores */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="text-[11px] text-[#5e6d75] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Codec H.264 • Audio Estéreo 48kHz • Optimizado</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={status !== 'ready'}
            className="px-3 py-1.5 rounded-xl border border-[#cbd5e1] hover:border-[#0284c7] bg-white text-[#141413] hover:text-[#0284c7] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerar toma</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadVideo}
            disabled={status !== 'ready'}
            className="px-3.5 py-1.5 rounded-xl bg-[#2a7b9b] hover:bg-[#1f5f78] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar MP4</span>
          </button>
        </div>
      </div>
    </div>
  );
};
