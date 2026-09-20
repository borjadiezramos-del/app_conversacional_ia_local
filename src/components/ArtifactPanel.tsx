import React, { useState } from 'react';
import { Artifact, ViewMode } from '../types';
import {
  Eye,
  Code2,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  Sparkles,
  History,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface ArtifactPanelProps {
  artifacts: Artifact[];
  activeArtifactIndex: number;
  onSelectVersion: (index: number) => void;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({
  artifacts,
  activeArtifactIndex,
  onSelectVersion,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fragmentPulse, setFragmentPulse] = useState<boolean>(false);

  const currentArtifact = artifacts[activeArtifactIndex] || artifacts[0];

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Simula la reevaluación aislada del @st.fragment sin recargar el resto de la aplicación
    setFragmentPulse(true);
    setTimeout(() => setFragmentPulse(false), 600);
  };

  const handleCopyCode = () => {
    if (!currentArtifact) return;
    navigator.clipboard.writeText(currentArtifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentArtifact) return;
    const blob = new Blob([currentArtifact.code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentArtifact.title.toLowerCase().replace(/\s+/g, '_')}_v${currentArtifact.version}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!currentArtifact) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-2xl border border-[#dcf0fa]">
        <Layers className="w-12 h-12 text-[#2a7b9b]/40 mb-3" />
        <h3 className="text-base font-bold text-[#141413]">Sin artefactos activos</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Escribe "generar dashboard" en el chat conversacional para instanciar un artefacto interactivo.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-2xl border border-[#dcf0fa] shadow-[0_4px_24px_rgba(42,123,155,0.06)] overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      }`}
    >
      {/* Barra de herramientas superior del Visor de Artefactos */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#ffffff] border-b border-slate-200/90 gap-2">
        {/* Left Side: Version & Title */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center bg-[#f5f5f5] rounded-lg p-0.5 border border-slate-200">
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[#2a7b9b] text-white rounded-md shadow-2xs">
              v{currentArtifact.version}
            </span>
            {artifacts.length > 1 && (
              <select
                value={activeArtifactIndex}
                onChange={(e) => onSelectVersion(Number(e.target.value))}
                className="text-[11px] font-semibold bg-transparent text-slate-700 pl-1.5 pr-2 py-0.5 outline-none cursor-pointer"
                title="Historial de versiones del artefacto"
              >
                {artifacts.map((art, idx) => (
                  <option key={art.id} value={idx}>
                    v{art.version} • {art.createdAt}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#141413] flex items-center gap-2">
              <span>{currentArtifact.title}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                  fragmentPulse
                    ? 'bg-[#2a7b9b] text-white border-[#2a7b9b] scale-105'
                    : 'bg-[#dcf0fa] text-[#2a7b9b] border-[#2a7b9b]/25'
                }`}
                title="Decorador @st.fragment: previene recargas del chat al interactuar"
              >
                @st.fragment activo
              </span>
            </h3>
          </div>
        </div>

        {/* Right Side: Toggle Radio & Actions */}
        <div className="flex items-center space-x-2">
          {/* Segmented Radio Buttons (Vista Previa vs Vista de Código) */}
          <div className="flex items-center bg-[#f5f5f5] p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleModeChange('preview')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'preview'
                  ? 'bg-white text-[#2a7b9b] shadow-xs border border-[#2a7b9b]/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista Previa</span>
            </button>

            <button
              onClick={() => handleModeChange('code')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'code'
                  ? 'bg-white text-[#2a7b9b] shadow-xs border border-[#2a7b9b]/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Código</span>
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
            <button
              onClick={handleCopyCode}
              className="p-1.5 text-slate-500 hover:text-[#2a7b9b] hover:bg-[#dcf0fa] rounded-lg transition"
              title="Copiar código del artefacto"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 text-slate-500 hover:text-[#2a7b9b] hover:bg-[#dcf0fa] rounded-lg transition"
              title="Descargar archivo HTML del artefacto"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-500 hover:text-[#2a7b9b] hover:bg-[#dcf0fa] rounded-lg transition"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Display Area: Iframe Sandbox or Syntax-Highlighted Code */}
      <div className="flex-1 overflow-hidden relative bg-[#f8fafc]">
        {viewMode === 'preview' ? (
          /* Renderizado de Iframe Seguro (st.components.v1.html) */
          <div className="w-full h-full relative">
            <iframe
              title={currentArtifact.title}
              srcDoc={currentArtifact.code}
              sandbox="allow-scripts allow-modals allow-same-origin"
              className="w-full h-full border-none bg-white"
            />
          </div>
        ) : (
          /* Vista de Código Fuente con numeración y sintaxis */
          <div className="w-full h-full overflow-auto bg-[#141413] text-slate-100 p-4 font-mono text-xs leading-relaxed select-text">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#2a7b9b]" />
                <span>Formato: {currentArtifact.type.toUpperCase()} / Tailwind CSS / Vanilla JS</span>
              </span>
              <span>{currentArtifact.code.split('\n').length} líneas de código</span>
            </div>
            <pre>
              <code>{currentArtifact.code}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2 bg-[#f5f5f5] border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2a7b9b]" />
          <span>Sandbox Aislado de Seguridad</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Creado a las {currentArtifact.createdAt}</span>
          <span className="font-semibold text-[#2a7b9b]">Marca BDR</span>
        </div>
      </div>
    </div>
  );
};
