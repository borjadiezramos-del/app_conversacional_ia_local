import React, { useRef, useEffect } from 'react';
import { 
  Paperclip, 
  HardDrive, 
  MoreHorizontal, 
  ChevronRight, 
  FileEdit, 
  Compass, 
  Code2, 
  GraduationCap, 
  Image as ImageIcon, 
  Film,
  Music,
  MessageSquare,
  Sparkles,
  Check,
  Globe
} from 'lucide-react';
import { ChatMode } from '../types';

interface GeminiToolsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFilesClick: () => void;
  onAddFromDriveClick: () => void;
  currentMode: ChatMode;
  onSelectMode: (mode: ChatMode) => void;
  onGenerateImagePrompt?: () => void;
  isWebSearchActive?: boolean;
  onToggleWebSearch?: () => void;
}

export const GeminiToolsPopover: React.FC<GeminiToolsPopoverProps> = ({
  isOpen,
  onClose,
  onUploadFilesClick,
  onAddFromDriveClick,
  currentMode,
  onSelectMode,
  onGenerateImagePrompt,
  isWebSearchActive = false,
  onToggleWebSearch,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      id="gemini-tools-popover"
      className="absolute bottom-full left-0 mb-3 w-72 sm:w-80 bg-white border border-[#e2e8f0] rounded-3xl shadow-[0_16px_45px_rgba(0,0,0,0.14)] z-50 p-2 text-[#141413] animate-fadeIn select-none max-h-[460px] overflow-y-auto"
    >
      {/* 1. SECCIÓN DE ARCHIVOS Y SUBIDAS */}
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => {
            onUploadFilesClick();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#f8fafc] text-[#141413] transition group text-left cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center text-[#5e6d75] group-hover:text-[#2a7b9b]">
            <Paperclip className="w-4 h-4 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#141413]">Subir archivos</span>
            <span className="text-[11px] text-[#5e6d75]">PDF, Excel, Word, imágenes o código</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            onAddFromDriveClick();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#f8fafc] text-[#141413] transition group text-left cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center text-[#5e6d75] group-hover:text-[#2a7b9b]">
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#141413]">Añadir desde Drive / Base de Conocimiento</span>
            <span className="text-[11px] text-[#5e6d75]">Proyectos BDR y notas corporativas</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            onUploadFilesClick();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl hover:bg-[#f8fafc] text-[#5e6d75] hover:text-[#141413] transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-[#5e6d75]">
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Más subidas</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94a3b8]" />
        </button>
      </div>

      {/* DIVISOR SUTIL */}
      <div className="my-1.5 border-t border-[#f1f5f9] mx-2" />

      {/* BÚSQUEDA WEB EN VIVO (CONEXIÓN A INTERNET) */}
      {onToggleWebSearch && (
        <div className="p-1">
          <button
            type="button"
            onClick={() => {
              onToggleWebSearch();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition group text-left cursor-pointer border ${
              isWebSearchActive
                ? 'bg-[#dcf0fa] border-[#2a7b9b]/40 text-[#2a7b9b] shadow-xs'
                : 'bg-white border-[#e2e8f0] hover:bg-[#f8fafc] text-[#141413]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isWebSearchActive ? 'bg-[#2a7b9b] text-white' : 'bg-[#f1f5f9] text-[#5e6d75]'
              }`}>
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[#141413]">Búsqueda Web en Vivo</span>
                  {isWebSearchActive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#2a7b9b] text-white">
                      ACTIVA
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#5e6d75]">
                  {isWebSearchActive ? 'Consultando internet en tiempo real' : 'Conecta el modelo a internet'}
                </span>
              </div>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
              isWebSearchActive ? 'bg-[#2a7b9b]' : 'bg-[#cbd5e1]'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                isWebSearchActive ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>
      )}

      {/* DIVISOR SUTIL */}
      <div className="my-1.5 border-t border-[#f1f5f9] mx-2" />

      {/* 2. SECCIÓN DE FUNCIONES Y MODOS ESPECIALIZADOS */}
      <div className="space-y-0.5">
        {/* MODO CANVA */}
        <button
          type="button"
          onClick={() => {
            onSelectMode('canvas');
            onClose();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl transition group text-left cursor-pointer ${
            currentMode === 'canvas' ? 'bg-[#dcf0fa] text-[#2a7b9b] font-medium ring-1 ring-[#2a7b9b]/30' : 'hover:bg-[#f8fafc] text-[#141413]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-[#2a7b9b]">
              <FileEdit className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Canva</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#dcf0fa] text-[#2a7b9b] border border-[#2a7b9b]/30 font-bold">
                  Panel lateral
                </span>
              </div>
              <span className="text-[11px] text-[#5e6d75]">Documentos, slides y código interactivo</span>
            </div>
          </div>
          {currentMode === 'canvas' && <Check className="w-4 h-4 text-[#2a7b9b]" />}
        </button>

        {/* MODO DEEP RESEARCH */}
        <button
          type="button"
          onClick={() => {
            onSelectMode('deep_research');
            onClose();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl transition group text-left cursor-pointer ${
            currentMode === 'deep_research' ? 'bg-[#ede9fe] text-[#4f46e5] font-medium ring-1 ring-[#4f46e5]/30' : 'hover:bg-[#f8fafc] text-[#141413]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-[#4f46e5]">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Deep Research</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ede9fe] text-[#4f46e5] border border-[#4f46e5]/30 font-bold">
                  Autónomo
                </span>
              </div>
              <span className="text-[11px] text-[#5e6d75]">Plan editable, rastreo y fuentes</span>
            </div>
          </div>
          {currentMode === 'deep_research' && <Check className="w-4 h-4 text-[#4f46e5]" />}
        </button>

        {/* MODO CODE (Sin el 'como Claude') */}
        <button
          type="button"
          onClick={() => {
            onSelectMode('code');
            onClose();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl transition group text-left cursor-pointer ${
            currentMode === 'code' ? 'bg-[#d1fae5] text-[#059669] font-medium ring-1 ring-[#059669]/30' : 'hover:bg-[#f8fafc] text-[#141413]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-[#059669]">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Code</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#d1fae5] text-[#059669] border border-[#059669]/30 font-bold">
                  Sandbox
                </span>
              </div>
              <span className="text-[11px] text-[#5e6d75]">Programación interactiva, scripts y ejecución</span>
            </div>
          </div>
          {currentMode === 'code' && <Check className="w-4 h-4 text-[#059669]" />}
        </button>

        {/* MODO APRENDIZAJE GUIADO */}
        <button
          type="button"
          onClick={() => {
            onSelectMode('guided_learning');
            onClose();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl transition group text-left cursor-pointer ${
            currentMode === 'guided_learning' ? 'bg-[#fef3c7] text-[#d97706] font-medium ring-1 ring-[#d97706]/30' : 'hover:bg-[#f8fafc] text-[#141413]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-[#d97706]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Aprendizaje guiado</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#fef3c7] text-[#d97706] border border-[#d97706]/30 font-bold">
                  Socrático
                </span>
              </div>
              <span className="text-[11px] text-[#5e6d75]">Preguntas reflexivas, quiz y flashcards</span>
            </div>
          </div>
          {currentMode === 'guided_learning' && <Check className="w-4 h-4 text-[#d97706]" />}
        </button>

        {/* CREAR IMAGEN */}
        <button
          type="button"
          onClick={() => {
            onSelectMode('image_gen');
            onClose();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl transition group text-left cursor-pointer ${
            currentMode === 'image_gen' ? 'bg-[#fae8ff] text-[#c026d3] font-medium ring-1 ring-[#c026d3]/30' : 'hover:bg-[#f8fafc] text-[#141413]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-[#c026d3]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Crear imagen</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#fae8ff] text-[#c026d3] border border-[#c026d3]/30 font-bold">
                  Difusión
                </span>
              </div>
              <span className="text-[11px] text-[#5e6d75]">Diagramas, visuales y arte en alta definición</span>
            </div>
          </div>
          {currentMode === 'image_gen' && <Check className="w-4 h-4 text-[#c026d3]" />}
        </button>

        {/* CREAR VÍDEO */}
        <button
          type="button"
          onClick={() => {
            onSelectMode('video_gen');
            onClose();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl transition group text-left cursor-pointer ${
            currentMode === 'video_gen' ? 'bg-[#e0f2fe] text-[#0284c7] font-medium ring-1 ring-[#0284c7]/30' : 'hover:bg-[#f8fafc] text-[#141413]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-[#0284c7]">
              <Film className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Crear vídeo</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#e0f2fe] text-[#0284c7] border border-[#0284c7]/30 font-bold">
                  Render 60fps
                </span>
              </div>
              <span className="text-[11px] text-[#5e6d75]">Secuencias animadas y reproductor nativo</span>
            </div>
          </div>
          {currentMode === 'video_gen' && <Check className="w-4 h-4 text-[#0284c7]" />}
        </button>

        {/* CREAR MÚSICA */}
        <button
          type="button"
          onClick={() => {
            onSelectMode('music_gen');
            onClose();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl transition group text-left cursor-pointer ${
            currentMode === 'music_gen' ? 'bg-[#ccfbf1] text-[#0d9488] font-medium ring-1 ring-[#0d9488]/30' : 'hover:bg-[#f8fafc] text-[#141413]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-[#0d9488]">
              <Music className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Crear música</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ccfbf1] text-[#0d9488] border border-[#0d9488]/30 font-bold">
                  Waveform
                </span>
              </div>
              <span className="text-[11px] text-[#5e6d75]">Síntesis de audio interactivo y descarga</span>
            </div>
          </div>
          {currentMode === 'music_gen' && <Check className="w-4 h-4 text-[#0d9488]" />}
        </button>
      </div>

      {/* DIVISOR SUTIL */}
      <div className="my-1.5 border-t border-[#f1f5f9] mx-2" />

      {/* 3. MODO GENERAL / CHAT ESTÁNDAR */}
      <button
        type="button"
        onClick={() => {
          onSelectMode('standard');
          onClose();
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl transition group text-left cursor-pointer ${
          currentMode === 'standard' ? 'bg-[#f1f5f9] text-[#141413] font-semibold' : 'hover:bg-[#f8fafc] text-[#5e6d75] hover:text-[#141413]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center text-[#5e6d75]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Modo General</span>
        </div>
        {currentMode === 'standard' && <Check className="w-4 h-4 text-[#2a7b9b]" />}
      </button>
    </div>
  );
};
