import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles,
  MessageSquare,
  FileEdit,
  Compass,
  Code2,
  GraduationCap,
  PanelRightOpen,
  PanelRightClose,
  X,
  Plus,
  Mic,
  Paperclip,
  Image as ImageIcon,
  Film,
  Music
} from 'lucide-react';
import { Message, LocalModel, AttachedFile, Conversation, ChatMode, CanvasDocument } from '../types';
import { ModelSelector } from './ModelSelector';
import { AttachmentBadgeList } from './FileUploadZone';
import { ThinkingOrb } from './ThinkingOrb';
import { ConversationActionMenu } from './ConversationActionMenu';
import { DeepResearchCard } from './DeepResearchCard';
import { GuidedLearningCard } from './GuidedLearningCard';
import { CanvasMessageCard } from './CanvasMessageCard';
import { GeminiToolsPopover } from './GeminiToolsPopover';
import { DocumentAttachModal } from './DocumentAttachModal';
import { ImageGenerationCard } from './ImageGenerationCard';
import { VideoGenerationCard } from './VideoGenerationCard';
import { MusicGenerationCard } from './MusicGenerationCard';
import { getFileCategory } from '../data/localModels';

interface CenteredChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string, attachments?: AttachedFile[], mode?: ChatMode) => void;
  isGenerating: boolean;
  currentProject: string | null;
  models: LocalModel[];
  selectedModel: LocalModel;
  onSelectModel: (model: LocalModel) => void;
  onAddModel: (model: LocalModel) => void;
  onRemoveModel?: (id: string) => void;
  activeConversation?: Conversation;
  onTogglePin?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onDeleteConversation?: (id: string) => void;
  chatMode: ChatMode;
  onChangeChatMode: (mode: ChatMode) => void;
  onOpenCanvasDoc?: (doc: CanvasDocument) => void;
  isCanvasOpen?: boolean;
  onToggleCanvas?: () => void;
  activeCanvasDoc?: CanvasDocument | null;
}

const CHAT_MODES_LIST = [
  {
    id: 'standard' as ChatMode,
    label: 'General',
    icon: MessageSquare,
    tooltip: 'Modo estándar para consultas y respuestas directas',
  },
  {
    id: 'canvas' as ChatMode,
    label: 'Canva',
    icon: FileEdit,
    badgeColor: 'bg-[#2a7b9b]',
    tooltip: 'Genera documentos, diapositivas y código en el panel lateral editable en tiempo real',
  },
  {
    id: 'deep_research' as ChatMode,
    label: 'Deep Research',
    icon: Compass,
    badgeColor: 'bg-gradient-to-r from-[#4f46e5] to-[#7c3aed]',
    tooltip: 'Investigación autónoma multi-etapa con plan editable, rastreo y reporte ejecutivo',
  },
  {
    id: 'code' as ChatMode,
    label: 'Code',
    icon: Code2,
    badgeColor: 'bg-[#059669]',
    tooltip: 'Programación: scripts, sandbox de ejecución interactiva y descarga de código',
  },
  {
    id: 'guided_learning' as ChatMode,
    label: 'Aprendizaje guiado',
    icon: GraduationCap,
    badgeColor: 'bg-[#d97706]',
    tooltip: 'Tutor pedagógico socrático: preguntas reflexivas, quiz interactivo y flashcards',
  },
  {
    id: 'image_gen' as ChatMode,
    label: 'Crear imagen',
    icon: ImageIcon,
    badgeColor: 'bg-[#c026d3]',
    tooltip: 'Generador de imágenes mediante IA con controles de descarga y regeneración',
  },
  {
    id: 'video_gen' as ChatMode,
    label: 'Crear vídeo',
    icon: Film,
    badgeColor: 'bg-[#0284c7]',
    tooltip: 'Generación de vídeo cinemático con reproductor nativo embebido',
  },
  {
    id: 'music_gen' as ChatMode,
    label: 'Crear música',
    icon: Music,
    badgeColor: 'bg-[#0d9488]',
    tooltip: 'Síntesis de pistas de audio con reproductor de forma de onda y descarga WAV',
  },
];

export const CenteredChatArea: React.FC<CenteredChatAreaProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  currentProject,
  models,
  selectedModel,
  onSelectModel,
  onAddModel,
  onRemoveModel,
  activeConversation,
  onTogglePin,
  onRenameConversation,
  onDeleteConversation,
  chatMode,
  onChangeChatMode,
  onOpenCanvasDoc,
  isCanvasOpen,
  onToggleCanvas,
  activeCanvasDoc,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isToolsPopoverOpen, setIsToolsPopoverOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleAddAttachments = (newFiles: AttachedFile[]) => {
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newItems: AttachedFile[] = [];

    Array.from(e.target.files).forEach((file) => {
      const category = getFileCategory(file);
      let previewUrl: string | undefined = undefined;

      if (category === 'image') {
        previewUrl = URL.createObjectURL(file);
      }

      newItems.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'unknown',
        category,
        previewUrl,
        source: 'local',
      });
    });

    handleAddAttachments(newItems);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isGenerating) return;

    onSendMessage(inputText.trim(), attachments, chatMode);
    setInputText('');
    setAttachments([]);
    setIsToolsPopoverOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleToggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulación de dictado por voz interactivo
      const dictations = [
        'Elaborar informe de métricas del trimestre con gráficos comparativos',
        'Crear una propuesta de servicios de IA local para el comité ejecutivo',
        'Analizar la reducción de costes al migrar inferencia a infraestructura propia',
        'Escribir un script en Python para conciliar balances contables',
      ];
      const randomPrompt = dictations[Math.floor(Math.random() * dictations.length)];
      setTimeout(() => {
        setInputText(randomPrompt);
        setIsListening(false);
      }, 1600);
    } else {
      setIsListening(false);
    }
  };

  const activeModeConfig = CHAT_MODES_LIST.find((m) => m.id === chatMode) || CHAT_MODES_LIST[0];

  const getPlaceholder = () => {
    if (chatMode === 'canvas') {
      return `Pregunta a Canva o describe el documento a editar en tiempo real...`;
    }
    if (chatMode === 'deep_research') {
      return `Pregunta a Deep Research o escribe el tema a investigar a fondo...`;
    }
    if (chatMode === 'code') {
      return `Pregunta a Code o describe el script/algoritmo que deseas programar...`;
    }
    if (chatMode === 'guided_learning') {
      return `Pregunta a Aprendizaje guiado o qué concepto deseas aprender paso a paso...`;
    }
    if (chatMode === 'image_gen') {
      return `Describe con detalle la imagen que deseas generar mediante IA...`;
    }
    if (chatMode === 'video_gen') {
      return `Describe la escena o animación para generar tu vídeo cinemático...`;
    }
    if (chatMode === 'music_gen') {
      return `Describe el ritmo, tempo y estilo de música o pista de audio...`;
    }
    return `Pregunta a Gemini`;
  };

  return (
    <div 
      id="bdr-main-chat-viewport"
      className="flex-1 flex flex-col h-full bg-[#f5f5f5] relative overflow-hidden text-[#141413]"
    >
      {/* Hidden input for local file uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.xlsx,.xls,.csv,.tsv,.docx,.doc,.txt,.rtf,.odt,.md"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Modal de Documentos / Drive */}
      {isDriveModalOpen && (
        <DocumentAttachModal
          isOpen={isDriveModalOpen}
          onClose={() => setIsDriveModalOpen(false)}
          onAttachFiles={handleAddAttachments}
          title="Añadir documentos desde Google Drive / Base de Conocimiento"
          initialSource="drive"
        />
      )}

      {/* Barra superior de contexto con selector de modelos locales y control de panel lateral */}
      <div className="w-full bg-[#f5f5f5]/90 backdrop-blur-md border-b border-[#e2e8f0] px-4 sm:px-6 py-2.5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2 text-xs text-[#5e6d75]">
          <span className="font-semibold text-[#141413]">Proyecto:</span>
          {currentProject ? (
            <span className="px-2 py-0.5 rounded-full bg-[#dcf0fa] border border-[#2a7b9b]/30 text-[#2a7b9b] font-medium flex items-center gap-1">
              <span>📁</span>
              <span>{currentProject}</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-white text-[#5e6d75] font-medium flex items-center gap-1 border border-[#e2e8f0]">
              <span>✨</span>
              <span>Sin proyecto</span>
            </span>
          )}
          {activeConversation && (
            <>
              <span className="text-[#cbd5e1]">•</span>
              <div className="flex items-center gap-1.5 font-medium text-[#141413] bg-white px-2 py-0.5 rounded-full border border-[#e2e8f0]">
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeConversation.title}</span>
                {onTogglePin && onRenameConversation && onDeleteConversation && (
                  <ConversationActionMenu
                    conversationId={activeConversation.id}
                    title={activeConversation.title}
                    isPinned={activeConversation.pinned}
                    onTogglePin={onTogglePin}
                    onRename={onRenameConversation}
                    onDelete={onDeleteConversation}
                  />
                )}
              </div>
            </>
          )}

          {/* Badge del modo actual si no es estándar */}
          {chatMode !== 'standard' && (
            <>
              <span className="text-[#cbd5e1] hidden sm:inline">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#dcf0fa] border border-[#2a7b9b]/30 font-semibold text-[11px] text-[#2a7b9b]">
                <activeModeConfig.icon className="w-3 h-3 text-[#2a7b9b]" />
                <span>{activeModeConfig.label}</span>
              </span>
            </>
          )}
        </div>

        {/* Lado derecho: Botón de abrir panel lateral Canva/Code si está disponible */}
        <div className="flex items-center gap-2">
          {activeCanvasDoc && onToggleCanvas && (
            <button
              id="btn-toggle-canvas-panel"
              type="button"
              onClick={onToggleCanvas}
              title={isCanvasOpen ? 'Ocultar panel Canva/Code' : 'Abrir panel lateral Canva/Code'}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                isCanvasOpen
                  ? 'bg-[#2a7b9b] text-white shadow-xs'
                  : 'bg-white text-[#2a7b9b] hover:bg-[#dcf0fa] border border-[#2a7b9b]/30'
              }`}
            >
              {isCanvasOpen ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ocultar panel</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ver panel</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Área con scroll para el contenido del chat (Contenedor de lectura contenida: max-w-[800px] centrado) */}
      <div 
        id="bdr-scroll-container"
        className="flex-1 overflow-y-auto px-4 sm:px-6 pt-4 pb-48"
      >
        <div className="max-w-[800px] w-full mx-auto">
          {/* CASO A: ESTADO VACÍO */}
          {messages.length === 0 ? (
            <div 
              id="bdr-empty-state"
              className="relative flex flex-col items-center justify-center pt-24 sm:pt-36 pb-10 text-center animate-fadeIn select-none"
            >
              {/* Resplandor ambiental suave en tonos primario y secundario */}
              <div 
                aria-hidden="true" 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-80 pointer-events-none -z-0 overflow-visible flex items-center justify-center"
              >
                <div 
                  className="w-[450px] sm:w-[550px] h-[220px] sm:h-[260px] rounded-full opacity-35 blur-[75px]"
                  style={{
                    background: 'radial-gradient(circle, rgba(42, 123, 155, 0.25) 0%, rgba(220, 240, 250, 0.4) 50%, rgba(245, 245, 245, 0) 75%)'
                  }}
                />
              </div>

              {/* Título limpio centrado: ¿En qué deberíamos centrarnos? */}
              <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto px-4">
                <h1 className="text-3xl sm:text-5xl font-semibold text-[#141413] tracking-tight mb-2 select-none">
                  ¿En qué deberíamos centrarnos?
                </h1>
              </div>
            </div>
          ) : (
            /* CASO B: CONVERSACIÓN ACTIVA */
            <div className="space-y-4 pt-2">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                const modelLabel = msg.modelName || selectedModel.name;

                return (
                  <div
                    key={msg.id}
                    id={`chat-message-${msg.id}`}
                    className={`flex items-start animate-fadeIn ${
                      isAssistant ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[94%] sm:max-w-[88%] rounded-2xl p-4 text-[14.5px] leading-relaxed shadow-xs ${
                        isAssistant
                          ? 'bg-white border border-[#e2e8f0] text-[#141413]'
                          : 'bg-[#dcf0fa] border border-[#2a7b9b]/25 text-[#141413] ml-auto'
                      }`}
                    >
                      {/* Mostrar archivos adjuntos en el mensaje si existen */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2.5">
                          <AttachmentBadgeList
                            attachments={msg.attachments}
                            readOnly
                          />
                        </div>
                      )}

                      {/* Texto del mensaje */}
                      <div className="whitespace-pre-wrap font-sans">
                        {msg.content}
                      </div>

                      {/* Tarjeta de Canva o Código si el mensaje lo generó */}
                      {msg.canvasDoc && onOpenCanvasDoc && (
                        <CanvasMessageCard
                          document={msg.canvasDoc}
                          onOpenCanvas={onOpenCanvasDoc}
                        />
                      )}

                      {/* Reporte estructurado de Deep Research */}
                      {msg.deepResearch && (
                        <DeepResearchCard report={msg.deepResearch} />
                      )}

                      {/* Módulo pedagógico de Aprendizaje Guiado */}
                      {msg.guidedLearning && (
                        <GuidedLearningCard
                          session={msg.guidedLearning}
                          onNextStep={(prompt) => onSendMessage(prompt, [], 'guided_learning')}
                          onSendChatFollowup={(prompt) => onSendMessage(prompt, [], 'guided_learning')}
                        />
                      )}

                      {/* Generación de Imágenes mediante IA */}
                      {msg.imageGen && (
                        <ImageGenerationCard
                          imageItem={msg.imageGen}
                          onRegenerate={(prompt, ratio) => onSendMessage(`Generar imagen: ${prompt} (aspect ratio ${ratio})`, [], 'image_gen')}
                        />
                      )}

                      {/* Generación de Vídeo con reproductor nativo */}
                      {msg.videoGen && (
                        <VideoGenerationCard
                          videoItem={msg.videoGen}
                          onRegenerate={(prompt) => onSendMessage(`Generar vídeo: ${prompt}`, [], 'video_gen')}
                        />
                      )}

                      {/* Síntesis de Música y Audio con Waveform */}
                      {msg.musicGen && (
                        <MusicGenerationCard
                          musicItem={msg.musicGen}
                          onRegenerate={(genre, tempo) => onSendMessage(`Pista musical ${genre} a ${tempo}`, [], 'music_gen')}
                        />
                      )}

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#e2e8f0]/60 text-[10px] text-[#5e6d75]">
                        <span className="font-semibold tracking-wider text-[#141413]/80">
                          {isAssistant ? modelLabel : 'Tú'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Animación del modelo generando */}
              {isGenerating && (
                <div 
                  id="thinking-orb-container"
                  className="py-2.5 px-1 animate-fadeIn"
                >
                  <ThinkingOrb modelName={selectedModel.name} size={36} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* CAJA DE ENTRADA FLOTANTE ESTILO GEMINI */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#f5f5f5] via-[#f5f5f5]/90 to-transparent pointer-events-none z-20">
        <div className="max-w-[820px] w-full mx-auto pointer-events-auto space-y-2">
          
          {/* Previsualización de archivos antes de enviar */}
          {attachments.length > 0 && (
            <div className="bg-white p-2.5 rounded-2xl border border-[#e2e8f0] shadow-sm">
              <div className="text-[11px] font-semibold text-[#5e6d75] mb-1 px-1 flex items-center justify-between">
                <span>Archivos adjuntos para analizar ({attachments.length}):</span>
                <span className="text-[10px] text-[#2a7b9b] font-medium">Procesamiento local privado</span>
              </div>
              <AttachmentBadgeList
                attachments={attachments}
                onRemoveAttachment={handleRemoveAttachment}
              />
            </div>
          )}

          {/* Formulario de Input tipo Píldora / Cápsula idéntica a Gemini */}
          <form
            onSubmit={handleSubmit}
            id="bdr-chat-input-form"
            className="bg-white rounded-[32px] sm:rounded-full border border-[#cbd5e1] focus-within:border-[#2a7b9b] focus-within:ring-2 focus-within:ring-[#2a7b9b]/20 shadow-[0_8px_30px_rgba(42,123,155,0.08)] transition-all px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2 relative"
          >
            {/* Botón Acción Izquierda: '+' cerrado, '✕' abierto, despliega el Popover */}
            <div className="relative shrink-0">
              <button
                id="btn-gemini-tools-trigger"
                type="button"
                onClick={() => setIsToolsPopoverOpen(!isToolsPopoverOpen)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] active:scale-95 text-[#141413] flex items-center justify-center transition cursor-pointer"
                title={isToolsPopoverOpen ? 'Cerrar menú' : 'Subir archivos y modos especiales'}
              >
                {isToolsPopoverOpen ? (
                  <X className="w-4 h-4 text-[#141413]" />
                ) : (
                  <Plus className="w-4 h-4 text-[#141413]" />
                )}
              </button>

              {/* Popover */}
              <GeminiToolsPopover
                isOpen={isToolsPopoverOpen}
                onClose={() => setIsToolsPopoverOpen(false)}
                onUploadFilesClick={() => fileInputRef.current?.click()}
                onAddFromDriveClick={() => setIsDriveModalOpen(true)}
                currentMode={chatMode}
                onSelectMode={onChangeChatMode}
              />
            </div>

            {/* Icono sutil de chispa / Gemini */}
            <div className="text-[#2a7b9b] opacity-90 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Chip del Modo Activo si no es estándar (ej: [Canva ✕], [Deep Research ✕]) */}
            {chatMode !== 'standard' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#dcf0fa] text-[#2a7b9b] border border-[#2a7b9b]/30 shrink-0 animate-fadeIn">
                <activeModeConfig.icon className="w-3.5 h-3.5 text-[#2a7b9b]" />
                <span>{activeModeConfig.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeChatMode('standard');
                  }}
                  title="Volver a modo general"
                  className="hover:text-red-500 p-0.5 rounded-full hover:bg-white/60 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Textarea adaptable */}
            <textarea
              ref={textareaRef}
              id="bdr-chat-input-textarea"
              rows={1}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className="flex-1 max-h-36 resize-none bg-transparent border-none px-1.5 py-1 text-sm text-[#141413] placeholder-[#8c9ba5] focus:outline-none leading-relaxed font-sans"
            />

            {/* Lado Derecho: Selector de modelo */}
            <div className="shrink-0 flex items-center gap-1 sm:gap-1.5">
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={onSelectModel}
                onAddModel={onAddModel}
                onRemoveModel={onRemoveModel}
                variant="pill-light"
              />

              {/* Botón Micrófono */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 rounded-full transition cursor-pointer shrink-0 ${
                  isListening 
                    ? 'bg-red-50 text-red-600 ring-1 ring-red-400 animate-pulse' 
                    : 'text-[#5e6d75] hover:text-[#141413] hover:bg-[#f1f5f9]'
                }`}
                title={isListening ? 'Detener dictado' : 'Dictado por voz'}
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Botón Enviar */}
              <button
                id="btn-send-message"
                type="submit"
                disabled={(!inputText.trim() && attachments.length === 0) || isGenerating}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
                  (inputText.trim() || attachments.length > 0) && !isGenerating
                    ? 'bg-[#2a7b9b] text-white hover:bg-[#1f5f78] shadow-sm'
                    : 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed'
                }`}
                title="Enviar mensaje (Enter)"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </form>

          {/* Pie informativo sutil */}
          <div className="flex items-center justify-between px-3 text-[11px] text-[#5e6d75]">
            <span>Enter para enviar</span>
            <span className="hidden sm:inline">Modelo: <strong className="text-[#141413] font-medium">{selectedModel.name}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

