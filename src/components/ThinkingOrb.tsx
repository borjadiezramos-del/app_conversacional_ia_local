import React, { useEffect, useRef, useState } from 'react';

interface ThinkingOrbProps {
  modelName: string;
  size?: number; // default 38-42px for elegant inline placement
}

const THINKING_STEPS = [
  'Analizando la consulta y contexto...',
  'Evaluando parámetros del modelo...',
  'Recuperando y procesando información...',
  'Sintetizando estructura de respuesta...',
  'Generando tokens finales...',
];

export const ThinkingOrb: React.FC<ThinkingOrbProps> = ({ modelName, size = 42 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Ciclo sutil de pasos que el modelo realiza por detrás
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % THINKING_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.035;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = width * 0.44;

      ctx.clearRect(0, 0, width, height);

      // 1. Halo atmosférico exterior sutil
      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.18);
      outerGlow.addColorStop(0, 'rgba(42, 123, 155, 0.18)');
      outerGlow.addColorStop(0.6, 'rgba(142, 108, 255, 0.09)');
      outerGlow.addColorStop(1, 'rgba(42, 123, 155, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // 2. Esfera especular con recorte circular (efecto líquido vítreo estilo Siri / orb)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Fondo interior profundo
      const baseGrad = ctx.createRadialGradient(
        cx - radius * 0.25,
        cy - radius * 0.25,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      baseGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      baseGrad.addColorStop(0.7, 'rgba(10, 15, 28, 0.98)');
      baseGrad.addColorStop(1, 'rgba(4, 7, 15, 1)');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Cintas de ondas plasmáticas en movimiento (paleta BDR: #2a7b9b, #82f4ff, violeta suave, destello cálido)
      const waveLayers = [
        {
          color1: 'rgba(42, 123, 155, 0.88)',
          color2: 'rgba(130, 244, 255, 0.95)',
          speed: 1.0,
          freq: 2.2,
          amp: radius * 0.28,
          phase: 0,
          yOffset: Math.sin(t * 0.8) * (radius * 0.08),
        },
        {
          color1: 'rgba(175, 120, 245, 0.75)',
          color2: 'rgba(130, 244, 255, 0.8)',
          speed: 1.4,
          freq: 2.8,
          amp: radius * 0.22,
          phase: Math.PI * 0.4,
          yOffset: Math.cos(t * 0.9) * (radius * 0.07),
        },
        {
          color1: 'rgba(255, 216, 107, 0.65)',
          color2: 'rgba(255, 255, 255, 0.95)',
          speed: 1.8,
          freq: 3.2,
          amp: radius * 0.16,
          phase: Math.PI * 0.8,
          yOffset: Math.sin(t * 1.2) * (radius * 0.05),
        },
      ];

      ctx.globalCompositeOperation = 'screen';

      waveLayers.forEach((wave) => {
        ctx.beginPath();
        const startX = cx - radius;
        const endX = cx + radius;

        for (let x = startX; x <= endX; x += 2) {
          const normX = (x - startX) / (radius * 2);
          const envelope = Math.sin(normX * Math.PI);
          const waveVal =
            Math.sin(normX * wave.freq * Math.PI + t * wave.speed + wave.phase) *
            wave.amp *
            envelope;
          const y = cy + wave.yOffset + waveVal;

          if (x === startX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        for (let x = endX; x >= startX; x -= 2) {
          const normX = (x - startX) / (radius * 2);
          const envelope = Math.sin(normX * Math.PI);
          const waveVal =
            Math.sin(normX * wave.freq * Math.PI + t * wave.speed + wave.phase + 0.4) *
            (wave.amp * 0.7) *
            envelope;
          const thickness = (radius * 0.28) * envelope;
          const y = cy + wave.yOffset + waveVal + thickness;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const ribbonGrad = ctx.createLinearGradient(startX, cy, endX, cy);
        ribbonGrad.addColorStop(0, 'rgba(42, 123, 155, 0)');
        ribbonGrad.addColorStop(0.3, wave.color1);
        ribbonGrad.addColorStop(0.5, wave.color2);
        ribbonGrad.addColorStop(0.7, wave.color1);
        ribbonGrad.addColorStop(1, 'rgba(142, 108, 255, 0)');
        ctx.fillStyle = ribbonGrad;
        ctx.fill();
      });

      // 4. Haz central luminoso
      const coreFlare = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.85);
      coreFlare.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreFlare.addColorStop(0.2, 'rgba(160, 240, 255, 0.7)');
      coreFlare.addColorStop(0.5, 'rgba(180, 140, 255, 0.3)');
      coreFlare.addColorStop(1, 'rgba(42, 123, 155, 0)');

      ctx.save();
      ctx.scale(1, 0.35);
      ctx.fillStyle = coreFlare;
      ctx.beginPath();
      ctx.arc(cx, cy / 0.35, radius * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.globalCompositeOperation = 'source-over';

      // 5. Refracción del borde interior vítreo
      const innerRim = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
      innerRim.addColorStop(0, 'rgba(255, 255, 255, 0)');
      innerRim.addColorStop(0.85, 'rgba(160, 220, 255, 0.12)');
      innerRim.addColorStop(0.96, 'rgba(200, 180, 255, 0.28)');
      innerRim.addColorStop(1, 'rgba(42, 123, 155, 0.45)');
      ctx.fillStyle = innerRim;
      ctx.fillRect(0, 0, width, height);

      // 6. Reflejo especular superior
      const specHighlight = ctx.createLinearGradient(
        cx,
        cy - radius,
        cx,
        cy - radius * 0.2
      );
      specHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      specHighlight.addColorStop(0.4, 'rgba(200, 235, 255, 0.18)');
      specHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specHighlight;
      ctx.beginPath();
      ctx.ellipse(cx, cy - radius * 0.62, radius * 0.52, radius * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Reflejo inferior sutil
      const bottomSpec = ctx.createLinearGradient(
        cx,
        cy + radius * 0.5,
        cx,
        cy + radius
      );
      bottomSpec.addColorStop(0, 'rgba(42, 123, 155, 0)');
      bottomSpec.addColorStop(1, 'rgba(130, 244, 255, 0.3)');
      ctx.fillStyle = bottomSpec;
      ctx.beginPath();
      ctx.ellipse(cx, cy + radius * 0.75, radius * 0.45, radius * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 7. Borde de cristal exterior
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.lineWidth = 1.2;
      const strokeGrad = ctx.createLinearGradient(
        cx - radius,
        cy - radius,
        cx + radius,
        cy + radius
      );
      strokeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      strokeGrad.addColorStop(0.4, 'rgba(130, 244, 255, 0.25)');
      strokeGrad.addColorStop(0.8, 'rgba(180, 140, 255, 0.35)');
      strokeGrad.addColorStop(1, 'rgba(42, 123, 155, 0.2)');
      ctx.strokeStyle = strokeGrad;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const canvasPixelSize = size * dpr;

  return (
    <div className="inline-flex items-center gap-3 py-1 select-none animate-fadeIn">
      {/* Orbe animado sin contenedor de tarjeta/bocadillo */}
      <div 
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <canvas
          ref={canvasRef}
          width={canvasPixelSize}
          height={canvasPixelSize}
          style={{ width: size, height: size }}
          className="rounded-full drop-shadow-[0_2px_12px_rgba(42,123,155,0.25)]"
        />
      </div>

      {/* Texto sutil de lo que está haciendo el modelo por detrás */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-[#141413]">
          {modelName}
        </span>
        <span className="text-[#cbd5e1]">•</span>
        <span className="text-[#5e6d75] font-normal transition-all duration-300">
          {THINKING_STEPS[stepIndex]}
        </span>
      </div>
    </div>
  );
};
