import React from 'react';
import { BDRLogo } from './BDRLogo';
import { FileCode, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenSourceModal: () => void;
  onQuickGenerate: () => void;
  onResetSession: () => void;
  artifactsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSourceModal,
  onQuickGenerate,
  onResetSession,
  artifactsCount,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-10">
      {/* Brand & Concept Title */}
      <div className="flex items-center space-x-3">
        <BDRLogo size="md" variant="full" />
        <div className="hidden md:block h-5 w-px bg-slate-200" />
        <div className="hidden md:flex flex-col">
          <span className="text-xs font-bold text-[#141413]">
            Arquitectura de Workspace BDR
          </span>
          <span className="text-[10px] text-slate-500">
            Contenedor @st.fragment asíncrono y sistema de diseño BDR
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onQuickGenerate}
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#dcf0fa] text-[#2a7b9b] hover:bg-[#cbe9f7] border border-[#2a7b9b]/20 transition cursor-pointer"
          title="Generar artefacto interactivo de prueba"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generar Dashboard</span>
        </button>

        <button
          onClick={onOpenSourceModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2a7b9b] text-white hover:bg-[#1f5f78] shadow-xs transition cursor-pointer"
          title="Configuración del Sistema BDR"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Configuración</span>
        </button>

        <button
          onClick={onResetSession}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          title="Reiniciar sesión y mensajes"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
