import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download,
  Eye,
  Edit3,
  Code2,
  FileText,
  History,
  RotateCcw,
  Sparkles,
  Play,
  Columns,
  Layers,
  Save,
  Presentation,
  ChevronLeft,
  ChevronRight,
  Plus,
  Send,
  MessageSquare
} from 'lucide-react';
import { CanvasDocument, CanvasSlide } from '../types';

interface CanvasWorkspacePanelProps {
  document: CanvasDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDocument: (updated: CanvasDocument) => void;
  onSendChatFollowup?: (promptText: string) => void;
}

export const CanvasWorkspacePanel: React.FC<CanvasWorkspacePanelProps> = ({
  document,
  isOpen,
  onClose,
  onUpdateDocument,
  onSendChatFollowup,
}) => {
  if (!isOpen || !document) return null;

  const [localContent, setLocalContent] = useState(document.content);
  const [localTitle, setLocalTitle] = useState(document.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [docType, setDocType] = useState<CanvasDocument['type']>(document.type || 'markdown');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [previewKey, setPreviewKey] = useState(0);

  // Estado para presentaciones (slides)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slides, setSlides] = useState<CanvasSlide[]>(
    document.slides && document.slides.length > 0
      ? document.slides
      : [
          {
            id: 'slide-1',
            title: 'Resumen Ejecutivo BDR',
            subtitle: 'Estrategia y Métricas Clave de Adquisición',
            bullets: [
              'Crecimiento mensual del pipeline de prospección: +28%',
              'Optimización de cadencias automatizadas de seguimiento',
              'Tasa de cualificación SQL incrementada al 42%'
            ],
            notes: 'Enfatizar los resultados del último trimestre fiscal.'
          },
          {
            id: 'slide-2',
            title: 'Flujo de Cualificación BANT',
            subtitle: 'Proceso y Criterios Comerciales',
            bullets: [
              'Budget: Validación presupuestaria en llamada de descubrimiento',
              'Authority: Identificación del decisor económico y sponsors',
              'Need: Diagnóstico de puntos de fricción operativa',
              'Timeline: Definición de fecha objetivo de despliegue'
            ],
            notes: 'Mencionar la integración con el CRM corporativo.'
          },
          {
            id: 'slide-3',
            title: 'Hoja de Ruta y Próximos Pasos',
            subtitle: 'Plan de Despliegue Trimestral',
            bullets: [
              'Fase 1: Onboarding de nuevos SDRs y capacitación',
              'Fase 2: Pruebas A/B en plantillas de contacto en frío',
              'Fase 3: Revisión de KPIs con dirección de ventas'
            ],
            notes: 'Alinear recursos de operaciones antes del lanzamiento.'
          }
        ]
  );

  // Estado para edición contextual (bloque seleccionado)
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [contextualPrompt, setContextualPrompt] = useState('');
  const [showContextualBar, setShowContextualBar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sincronizar estado local cuando cambia el documento externo
  useEffect(() => {
    setLocalContent(document.content);
    setLocalTitle(document.title);
    if (document.type) setDocType(document.type);
    if (document.slides && document.slides.length > 0) {
      setSlides(document.slides);
    }
  }, [document.id, document.version]);

  const hasUnsavedChanges =
    localContent !== document.content || localTitle !== document.title;

  const handleSave = () => {
    const updatedHistory = document.history ? [...document.history] : [];
    if (localContent !== document.content) {
      updatedHistory.push({
        version: document.version,
        content: document.content,
        updatedAt: document.updatedAt,
      });
    }

    const updated: CanvasDocument = {
      ...document,
      title: localTitle.trim() || document.title,
      content: localContent,
      type: docType,
      slides: docType === 'presentation' ? slides : document.slides,
      version: hasUnsavedChanges ? document.version + 1 : document.version,
      updatedAt: 'Ahora',
      history: updatedHistory,
    };

    onUpdateDocument(updated);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let extension = 'txt';
    let mimeType = 'text/plain';

    if (docType === 'code') {
      const lang = document.language?.toLowerCase() || 'txt';
      if (lang.includes('python') || lang === 'py') extension = 'py';
      else if (lang.includes('typescript') || lang === 'ts' || lang === 'tsx') extension = 'tsx';
      else if (lang.includes('javascript') || lang === 'js' || lang === 'jsx') extension = 'jsx';
      else if (lang.includes('html')) { extension = 'html'; mimeType = 'text/html'; }
      else if (lang.includes('json')) { extension = 'json'; mimeType = 'application/json'; }
      else if (lang.includes('sql')) extension = 'sql';
      else extension = lang;
    } else if (docType === 'markdown') {
      extension = 'md';
      mimeType = 'text/markdown';
    } else if (docType === 'presentation') {
      extension = 'json';
      mimeType = 'application/json';
    }

    const contentToDownload = docType === 'presentation' ? JSON.stringify(slides, null, 2) : localContent;
    const blob = new Blob([contentToDownload], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    const sanitizedTitle = (localTitle || 'documento')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');
    link.download = `${sanitizedTitle}_v${document.version}.${extension}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Manejar selección de texto en textarea para edición contextual
  const handleSelectText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end && end - start > 4) {
      const text = textarea.value.substring(start, end);
      setSelectedText(text);
      setSelectionRange({ start, end });
      setShowContextualBar(true);
    } else {
      setShowContextualBar(false);
    }
  };

  const handleApplyContextualEdit = (promptText: string) => {
    if (!onSendChatFollowup || !selectedText) return;
    const fullPrompt = `[Edición contextual en Canvas] Modifica este bloque específico seleccionado: "${selectedText}" para: ${promptText}`;
    onSendChatFollowup(fullPrompt);
    setShowContextualBar(false);
    setSelectedText('');
  };

  const wordCount = localContent.trim() ? localContent.trim().split(/\s+/).length : 0;
  const lineCount = localContent.split('\n').length;
  const isCodeMode = docType === 'code' || docType === 'html';

  return (
    <div
      id="canvas-workspace-panel"
      className={`bg-white border-l border-[#e2e8f0] flex flex-col transition-all duration-300 shadow-xl z-30 ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-full h-full'
          : 'w-full lg:w-[50%] xl:w-[52%] h-full'
      }`}
    >
      {/* 1. Barra de herramientas superior */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Lado izquierdo: Tipo, Versión y Título */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Selector de tipo de documento */}
          <div className="flex items-center bg-white border border-[#cbd5e1] rounded-lg p-0.5 text-xs font-semibold text-[#141413] shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setDocType('markdown')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                docType === 'markdown' || docType === 'text' ? 'bg-[#dcf0fa] text-[#2a7b9b]' : 'text-[#64748b] hover:text-[#141413]'
              }`}
              title="Documento de texto largo y Markdown"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Texto</span>
            </button>

            <button
              type="button"
              onClick={() => setDocType('presentation')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                docType === 'presentation' ? 'bg-[#fef3c7] text-[#b45309]' : 'text-[#64748b] hover:text-[#141413]'
              }`}
              title="Presentación y diapositivas ejecutivas"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Slides</span>
            </button>

            <button
              type="button"
              onClick={() => setDocType('code')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                docType === 'code' || docType === 'html' ? 'bg-[#d1fae5] text-[#059669]' : 'text-[#64748b] hover:text-[#141413]'
              }`}
              title="Código y Sandbox"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Code</span>
            </button>

            <span className="text-[10px] bg-[#e2e8f0] text-[#475569] px-1.5 py-0.5 rounded font-mono font-bold ml-1">
              v{document.version}
            </span>
          </div>

          {/* Título editable */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="w-full text-xs font-bold text-[#141413] px-2 py-1 bg-white border border-[#2a7b9b] rounded-md focus:outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              title="Clic para renombrar documento"
              className="text-xs font-bold text-[#141413] hover:text-[#2a7b9b] truncate text-left transition group flex items-center gap-1.5"
            >
              <span className="truncate">{localTitle}</span>
              <Edit3 className="w-3 h-3 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition" />
            </button>
          )}
        </div>

        {/* Lado derecho: Pestañas de vista y acciones */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Selector de modo vista: Editor / Preview / Split */}
          <div className="flex items-center bg-[#e2e8f0] p-0.5 rounded-lg text-xs font-medium text-[#475569]">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 text-[11px] ${
                activeTab === 'edit'
                  ? 'bg-white text-[#141413] font-semibold shadow-2xs'
                  : 'hover:text-[#141413]'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editor</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('preview');
                setPreviewKey((prev) => prev + 1);
              }}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 text-[11px] ${
                activeTab === 'preview'
                  ? 'bg-white text-[#141413] font-semibold shadow-2xs'
                  : 'hover:text-[#141413]'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Vista previa</span>
            </button>

            <button
              onClick={() => setActiveTab('split')}
              className={`hidden md:flex px-2 py-1 rounded-md transition items-center gap-1 text-[11px] ${
                activeTab === 'split'
                  ? 'bg-white text-[#141413] font-semibold shadow-2xs'
                  : 'hover:text-[#141413]'
              }`}
            >
              <Columns className="w-3 h-3" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#cbd5e1] mx-0.5" />

          {/* Guardar cambios */}
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges && saveStatus !== 'saved'}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 shadow-2xs ${
              saveStatus === 'saved'
                ? 'bg-emerald-600 text-white'
                : hasUnsavedChanges
                ? 'bg-[#2a7b9b] hover:bg-[#1f5f78] text-white animate-pulse'
                : 'bg-white text-[#94a3b8] border border-[#e2e8f0] cursor-default'
            }`}
          >
            {saveStatus === 'saved' ? <Check className="w-3 h-3 text-white" /> : <Save className="w-3 h-3" />}
            <span className="hidden sm:inline">{saveStatus === 'saved' ? 'Guardado' : 'Guardar'}</span>
          </button>

          {/* Copiar */}
          <button
            onClick={handleCopy}
            title="Copiar contenido"
            className="p-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#475569] hover:text-[#141413] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Descargar */}
          <button
            onClick={handleDownload}
            title="Descargar archivo"
            className="p-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#475569] hover:text-[#141413] transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Pantalla completa */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#475569] hover:text-[#141413] transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Cerrar Canvas */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#fee2e2] text-[#64748b] hover:text-rose-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BARRA FLOTANTE DE EDICIÓN CONTEXTUAL: Se activa al seleccionar texto */}
      {showContextualBar && (
        <div className="bg-[#2a7b9b] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-md animate-fadeIn z-20">
          <div className="flex items-center gap-2 max-w-[280px] sm:max-w-md truncate">
            <Sparkles className="w-3.5 h-3.5 text-[#dcf0fa] shrink-0" />
            <span className="font-semibold text-[#dcf0fa] shrink-0">Bloque seleccionado:</span>
            <span className="truncate opacity-90 italic">“{selectedText}”</span>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <input
              type="text"
              value={contextualPrompt}
              onChange={(e) => setContextualPrompt(e.target.value)}
              placeholder="Ej: Reescribir más formal, sintetizar..."
              className="bg-white/15 text-white placeholder-white/60 text-xs px-2.5 py-1 rounded-lg border border-white/30 focus:outline-none focus:bg-white/25 flex-1 sm:w-56"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && contextualPrompt.trim()) {
                  handleApplyContextualEdit(contextualPrompt);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleApplyContextualEdit(contextualPrompt || 'Mejorar redacción')}
              className="px-2.5 py-1 bg-white text-[#2a7b9b] font-bold rounded-lg hover:bg-[#dcf0fa] transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Pedir al Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setShowContextualBar(false)}
              className="p-1 text-white/80 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Área Central de Trabajo: Editor y/o Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* VISTA DE PRESENTACIÓN / DIAPOSITIVAS (SLIDES) */}
        {docType === 'presentation' ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0f172a] text-white">
            {/* Cabecera del visor de diapositivas */}
            <div className="bg-[#1e293b] px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Presentation className="w-4 h-4 text-[#38bdf8]" />
                <span className="font-bold text-white">
                  Diapositiva {activeSlideIndex + 1} de {slides.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                  disabled={activeSlideIndex === 0}
                  className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 transition"
                  title="Diapositiva anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
                  disabled={activeSlideIndex === slides.length - 1}
                  className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 transition"
                  title="Diapositiva siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Diapositiva Principal en Pantalla */}
            <div className="flex-1 p-6 sm:p-10 flex items-center justify-center overflow-y-auto">
              {slides[activeSlideIndex] && (
                <div className="w-full max-w-2xl bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="border-b border-white/15 pb-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] text-[10px] font-bold uppercase tracking-wider">
                      Slide {activeSlideIndex + 1}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                      {slides[activeSlideIndex].title}
                    </h2>
                    {slides[activeSlideIndex].subtitle && (
                      <p className="text-xs text-[#94a3b8] mt-1">
                        {slides[activeSlideIndex].subtitle}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {slides[activeSlideIndex].bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-[#38bdf8] mt-1.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {slides[activeSlideIndex].notes && (
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-[11px] text-[#94a3b8]">
                      <span className="font-semibold text-white/90">Notas del orador: </span>
                      {slides[activeSlideIndex].notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tira de miniaturas de diapositivas */}
            <div className="bg-[#1e293b] p-3 border-t border-white/10 flex items-center gap-3 overflow-x-auto">
              {slides.map((slide, sIdx) => (
                <button
                  key={slide.id || sIdx}
                  type="button"
                  onClick={() => setActiveSlideIndex(sIdx)}
                  className={`px-3 py-2 rounded-xl text-left border shrink-0 transition text-xs w-36 ${
                    activeSlideIndex === sIdx
                      ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-white font-bold'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[9px] text-[#38bdf8] block">#{sIdx + 1}</span>
                  <span className="truncate block font-medium">{slide.title}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* MODO DOCUMENTO DE TEXTO LARGO O CÓDIGO */
          <>
            {/* Panel del Editor */}
            {(activeTab === 'edit' || activeTab === 'split') && (
              <div
                className={`flex-1 flex flex-col overflow-hidden bg-white ${
                  activeTab === 'split' ? 'border-r border-[#e2e8f0]' : ''
                }`}
              >
                <div className="px-4 py-1.5 bg-[#fafafa] border-b border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#64748b]">
                  <span className="font-mono text-[10px]">
                    {isCodeMode ? `Modo Código (${document.language || 'script'})` : 'Editor con detección de selección contextual'}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>{lineCount} líneas</span>
                    <span>•</span>
                    <span>{wordCount} palabras</span>
                  </div>
                </div>

                <textarea
                  id="canvas-content-editor"
                  ref={textareaRef}
                  value={localContent}
                  onChange={(e) => setLocalContent(e.target.value)}
                  onSelect={handleSelectText}
                  placeholder={isCodeMode ? '// Escribe o edita tu código aquí...' : 'Redacta o edita el documento aquí... Selecciona cualquier texto para modificarlo puntualmente con la IA.'}
                  spellCheck={!isCodeMode}
                  className={`flex-1 w-full p-4 text-xs text-[#1e293b] leading-relaxed resize-none focus:outline-none bg-transparent ${
                    isCodeMode ? 'font-mono text-[12px] bg-[#fcfcfc]' : 'font-sans text-[13px]'
                  }`}
                />
              </div>
            )}

            {/* Panel de Vista Previa */}
            {(activeTab === 'preview' || activeTab === 'split') && (
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="px-4 py-1.5 bg-[#fafafa] border-b border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#64748b]">
                  <span className="font-semibold text-[10px]">
                    {isCodeMode ? 'Salida renderizada / Previsualización Sandbox' : 'Vista previa de lectura'}
                  </span>
                  {isCodeMode && (
                    <button
                      onClick={() => setPreviewKey((k) => k + 1)}
                      className="flex items-center gap-1 text-[10px] text-[#2a7b9b] hover:underline font-medium"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>Actualizar</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-5 text-xs text-[#141413]">
                  {isCodeMode ? (
                    document.language?.toLowerCase() === 'html' || localContent.includes('<!DOCTYPE') || localContent.includes('<html') || localContent.includes('<div') ? (
                      <iframe
                        key={previewKey}
                        srcDoc={localContent}
                        title="Code Sandbox Preview"
                        sandbox="allow-scripts allow-modals"
                        className="w-full h-full min-h-[350px] border border-[#e2e8f0] rounded-xl bg-white shadow-2xs"
                      />
                    ) : (
                      <div className="bg-[#0f172a] text-[#f8fafc] p-4 rounded-xl font-mono text-[12px] leading-relaxed overflow-x-auto shadow-inner">
                        <pre className="whitespace-pre">{localContent}</pre>
                      </div>
                    )
                  ) : (
                    <div className="prose prose-slate max-w-none space-y-3 leading-relaxed">
                      <h1 className="text-lg font-bold text-[#141413] pb-2 border-b border-[#e2e8f0]">
                        {localTitle}
                      </h1>
                      <div className="whitespace-pre-wrap font-sans text-xs text-[#334155] leading-relaxed space-y-2">
                        {localContent.split('\n\n').map((paragraph, idx) => {
                          if (paragraph.startsWith('### ')) {
                            return <h3 key={idx} className="text-xs font-bold text-[#141413] mt-3 mb-1">{paragraph.replace('### ', '')}</h3>;
                          }
                          if (paragraph.startsWith('## ')) {
                            return <h2 key={idx} className="text-sm font-bold text-[#141413] mt-4 mb-1">{paragraph.replace('## ', '')}</h2>;
                          }
                          if (paragraph.startsWith('# ')) {
                            return <h1 key={idx} className="text-base font-bold text-[#141413] mt-4 mb-2">{paragraph.replace('# ', '')}</h1>;
                          }
                          if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                            const items = paragraph.split('\n');
                            return (
                              <ul key={idx} className="list-disc list-inside space-y-1 pl-2 text-xs text-[#334155]">
                                {items.map((it, i) => (
                                  <li key={i}>{it.replace(/^[-*]\s+/, '')}</li>
                                ))}
                              </ul>
                            );
                          }
                          return <p key={idx} className="text-xs text-[#334155] leading-relaxed">{paragraph}</p>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Barra inferior de acciones rápidas de refinamiento al chat */}
      <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[#64748b] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#2a7b9b]" />
            Refinar con IA:
          </span>
          {[
            { label: 'Hacer más conciso', prompt: 'Por favor, haz que el documento en Canva sea más conciso y directo, manteniendo los datos clave.' },
            { label: 'Añadir resumen ejecutivo', prompt: 'Añade un resumen ejecutivo al inicio del documento en Canva.' },
            { label: docType === 'presentation' ? 'Generar más diapositivas' : isCodeMode ? 'Optimizar y documentar' : 'Estructurar con viñetas', prompt: docType === 'presentation' ? 'Añade diapositivas adicionales de métricas y cierre a la presentación en Canva.' : isCodeMode ? 'Optimiza el código en el editor y añade comentarios explicativos detallados.' : 'Estructura el contenido del documento usando viñetas y encabezados claros.' },
            { label: 'Traducir a inglés', prompt: 'Por favor traduce el documento actual en Canva al inglés profesional.' },
          ].map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendChatFollowup && onSendChatFollowup(action.prompt)}
              className="px-2 py-0.5 rounded-md bg-white border border-[#cbd5e1] hover:border-[#2a7b9b] hover:text-[#2a7b9b] text-[10px] text-[#475569] font-medium transition cursor-pointer"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Historial de versiones */}
        {document.history && document.history.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-[#64748b]">
            <History className="w-3 h-3" />
            <span>Versiones:</span>
            <div className="flex items-center gap-1">
              {document.history.map((hist, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLocalContent(hist.content)}
                  className="px-1.5 py-0.5 rounded bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[9px] font-mono"
                  title={`Restaurar v${hist.version}`}
                >
                  v{hist.version}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
