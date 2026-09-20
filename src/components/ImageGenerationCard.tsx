import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Download,
  RotateCcw,
  Sparkles,
  Check,
  Maximize2,
  Sliders,
  Ratio,
  Edit2
} from 'lucide-react';
import { GeneratedImageItem } from '../types';

interface ImageGenerationCardProps {
  imageItem: GeneratedImageItem;
  onRegenerate?: (newPrompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3') => void;
}

export const ImageGenerationCard: React.FC<ImageGenerationCardProps> = ({
  imageItem,
  onRegenerate,
}) => {
  const [currentPrompt, setCurrentPrompt] = useState(imageItem.prompt);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>(
    imageItem.aspectRatio || '16:9'
  );
  const [status, setStatus] = useState<'generating' | 'ready' | 'error'>(imageItem.status);
  const [progress, setProgress] = useState(imageItem.status === 'ready' ? 100 : 25);
  const [stageText, setStageText] = useState('Inicializando modelo de difusión...');
  const [downloading, setDownloading] = useState(false);
  const [imageSeed, setImageSeed] = useState(Date.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simular pipeline de generación con estados realistas si entra como generating
  useEffect(() => {
    if (status === 'generating') {
      const t1 = setTimeout(() => {
        setProgress(45);
        setStageText('Generando composición geométrica y esquema de luz...');
      }, 600);

      const t2 = setTimeout(() => {
        setProgress(75);
        setStageText('Aplicando texturas en alta resolución y refinamiento...');
      }, 1300);

      const t3 = setTimeout(() => {
        setProgress(100);
        setStageText('Imagen generada con éxito');
        setStatus('ready');
      }, 2000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [status, imageSeed]);

  // Dibujar imagen procedural de alta estética en Canvas cuando esté lista
  useEffect(() => {
    if (status !== 'ready') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fondo degradado sofisticado acorde a la paleta
    const grad = ctx.createLinearGradient(0, 0, width, height);
    const hash = Array.from(currentPrompt).reduce((acc, char) => acc + char.charCodeAt(0), imageSeed);
    
    // Tonos elegantes basados en el tema #2a7b9b y el prompt
    const hueBase = (hash % 60) + 190; // Rango azul / petróleo / teal elegante
    grad.addColorStop(0, `hsl(${hueBase}, 65%, 22%)`);
    grad.addColorStop(0.5, `hsl(${(hueBase + 30) % 360}, 55%, 35%)`);
    grad.addColorStop(1, `hsl(${(hueBase + 70) % 360}, 70%, 15%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Formas orgánicas y luminosas de arte generativo
    for (let i = 0; i < 6; i++) {
      const x = (Math.sin(hash + i * 2.1) * 0.5 + 0.5) * width;
      const y = (Math.cos(hash + i * 1.7) * 0.5 + 0.5) * height;
      const radius = 80 + (i * 45);

      const radialGrad = ctx.createRadialGradient(x, y, 10, x, y, radius);
      radialGrad.addColorStop(0, `hsla(${(hueBase + i * 25) % 360}, 85%, 65%, 0.45)`);
      radialGrad.addColorStop(0.7, `hsla(${(hueBase + i * 40) % 360}, 80%, 45%, 0.15)`);
      radialGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cuadrícula sutil isométrica o tecnológica
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let gx = 0; gx < width; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // Puntos de luz focales
    for (let p = 0; p < 25; p++) {
      const px = ((hash * (p + 1) * 9301 + 49297) % 233280) / 233280 * width;
      const py = ((hash * (p + 3) * 9301 + 49297) % 233280) / 233280 * height;
      const pr = 1.5 + (p % 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Título / marca de agua discreta en la esquina inferior izquierda
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, sans-serif';
    const textSnippet = currentPrompt.length > 40 ? currentPrompt.slice(0, 40) + '...' : currentPrompt;
    ctx.fillText(`“${textSnippet}”`, 24, height - 32);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`BDR Generative Studio • ${aspectRatio} • Semilla #${hash % 9999}`, 24, height - 16);
  }, [status, currentPrompt, aspectRatio, imageSeed]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `bdr_imagen_${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error al descargar imagen', e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleTriggerRegenerate = () => {
    setStatus('generating');
    setProgress(15);
    setStageText('Generando nueva variación visual...');
    setImageSeed(Date.now() + Math.floor(Math.random() * 1000));
    if (onRegenerate) {
      onRegenerate(currentPrompt, aspectRatio);
    }
  };

  const getDimensions = () => {
    switch (aspectRatio) {
      case '16:9': return { w: 800, h: 450, classRatio: 'aspect-video' };
      case '9:16': return { w: 450, h: 800, classRatio: 'aspect-[9/16] max-w-[340px] mx-auto' };
      case '4:3': return { w: 800, h: 600, classRatio: 'aspect-[4/3]' };
      case '1:1':
      default:
        return { w: 600, h: 600, classRatio: 'aspect-square max-w-[480px] mx-auto' };
    }
  };

  const dims = getDimensions();

  return (
    <div className="mt-3 bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs text-xs space-y-4">
      {/* Cabecera del generador */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c026d3] to-[#7c3aed] text-white flex items-center justify-center shadow-xs">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#141413] text-sm">Generador de Imágenes IA</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                status === 'ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {status === 'ready' ? 'Listo' : 'Generando...'}
              </span>
            </div>
            <p className="text-[11px] text-[#5e6d75]">
              Modelo: <span className="font-medium text-[#141413]">BDR Diffusion Core</span>
            </p>
          </div>
        </div>

        {/* Selector de relación de aspecto */}
        <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-xl border border-[#cbd5e1] text-[11px]">
          {(['16:9', '1:1', '9:16'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setAspectRatio(r);
                handleTriggerRegenerate();
              }}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                aspectRatio === r
                  ? 'bg-white text-[#141413] font-bold shadow-2xs'
                  : 'text-[#64748b] hover:text-[#141413]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Editor del Prompt */}
      <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#5e6d75]">
          <span className="font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#c026d3]" />
            Prompt de generación:
          </span>
          <button
            type="button"
            onClick={() => setIsEditingPrompt(!isEditingPrompt)}
            className="text-[#2a7b9b] hover:underline font-medium flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditingPrompt ? 'Cerrar edición' : 'Modificar prompt'}</span>
          </button>
        </div>

        {isEditingPrompt ? (
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder="Describe detalladamente la imagen que deseas generar..."
              className="flex-1 bg-white border border-[#2a7b9b] rounded-lg px-3 py-1.5 text-xs text-[#141413] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setIsEditingPrompt(false);
                handleTriggerRegenerate();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#2a7b9b] text-white font-semibold text-xs hover:bg-[#1f5f78] transition shrink-0"
            >
              Generar
            </button>
          </div>
        ) : (
          <p className="text-xs text-[#1e293b] font-medium italic">
            “{currentPrompt}”
          </p>
        )}
      </div>

      {/* Contenedor de visualización y Canvas renderizado */}
      <div className="relative rounded-xl overflow-hidden border border-[#cbd5e1] bg-[#0f172a] shadow-inner flex items-center justify-center">
        {/* Estado de carga con progreso */}
        {status === 'generating' && (
          <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-full border-3 border-white/20 border-t-[#c026d3] animate-spin" />
            <div>
              <p className="text-white font-semibold text-xs">{stageText}</p>
              <p className="text-white/50 text-[11px] mt-0.5">{progress}% completado</p>
            </div>
            <div className="w-48 bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#c026d3] to-[#7c3aed] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Canvas de renderizado nativo */}
        <canvas
          ref={canvasRef}
          width={dims.w}
          height={dims.h}
          className={`w-full h-auto object-contain transition duration-300 ${dims.classRatio}`}
        />
      </div>

      {/* Barra de Controles y Acciones */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-[#5e6d75]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Resolución: {dims.w} x {dims.h} px • PNG Lossless</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Regenerar */}
          <button
            type="button"
            onClick={handleTriggerRegenerate}
            disabled={status === 'generating'}
            className="px-3 py-1.5 rounded-xl border border-[#cbd5e1] hover:border-[#2a7b9b] bg-white text-[#141413] hover:text-[#2a7b9b] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerar</span>
          </button>

          {/* Botón Descargar */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={status === 'generating' || downloading}
            className="px-3.5 py-1.5 rounded-xl bg-[#2a7b9b] hover:bg-[#1f5f78] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Descargando...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PNG</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
