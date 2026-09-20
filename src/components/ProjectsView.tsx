import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  FileText, 
  MessageSquare, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  Upload,
  X,
  Check,
  Calendar,
  Lock,
  HardDrive,
  Cloud,
  Layers,
  Link2,
  Paperclip,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
  FileCode,
  Download,
  ExternalLink,
  Eye,
  FilePlus,
  Filter,
  Save,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';
import { ProjectItem, ProjectKnowledgeFile, Conversation, AttachedFile } from '../types';
import { DocumentAttachModal } from './DocumentAttachModal';
import { MarkdownEditorModal } from './MarkdownEditorModal';
import { formatFileSize, getFileCategory } from '../data/localModels';

interface ProjectsViewProps {
  projects: ProjectItem[];
  conversations: Conversation[];
  onSelectProject: (project: ProjectItem) => void;
  onCreateProject: (project: Omit<ProjectItem, 'id' | 'updatedAt' | 'knowledgeFiles'> & { knowledgeFiles?: ProjectKnowledgeFile[] }) => void;
  onUpdateProject: (id: string, updates: Partial<ProjectItem>) => void;
  onDeleteProject: (id: string) => void;
  onOpenProjectChat: (project: ProjectItem) => void;
  onAddKnowledgeFile: (projectId: string, file: ProjectKnowledgeFile) => void;
  onAddKnowledgeFiles?: (projectId: string, files: ProjectKnowledgeFile[]) => void;
  onUpdateKnowledgeFile?: (projectId: string, fileId: string, updates: Partial<ProjectKnowledgeFile>) => void;
  onRemoveKnowledgeFile: (projectId: string, fileId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  conversations,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onOpenProjectChat,
  onAddKnowledgeFile,
  onAddKnowledgeFiles,
  onUpdateKnowledgeFile,
  onRemoveKnowledgeFile,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Estados para archivos de conocimiento y markdown
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [editingMarkdownFile, setEditingMarkdownFile] = useState<ProjectKnowledgeFile | null>(null);
  const [isDraggingKnowledge, setIsDraggingKnowledge] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const knowledgeFileInputRef = useRef<HTMLInputElement>(null);

  // Form states for creating a new project
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSystemPrompt, setNewSystemPrompt] = useState('');

  // Form states for editing via modal
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSystemPrompt, setEditSystemPrompt] = useState('');

  // Selected project object
  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;

  // Estados editables en vivo dentro de la vista de detalle del proyecto
  const [detailTitle, setDetailTitle] = useState('');
  const [detailDescription, setDetailDescription] = useState('');
  const [detailSystemPrompt, setDetailSystemPrompt] = useState('');
  const [isEditingTitleInline, setIsEditingTitleInline] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle');
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Sincronizar estados locales cuando se selecciona o actualiza el proyecto activo
  useEffect(() => {
    if (activeProject) {
      setDetailTitle(activeProject.name);
      setDetailDescription(activeProject.description);
      setDetailSystemPrompt(activeProject.systemPrompt || '');
      setIsEditingTitleInline(false);
    }
  }, [activeProject?.id]);

  // Detección en tiempo real de si existen modificaciones pendientes de guardar
  const hasUnsavedChanges = Boolean(
    activeProject && (
      detailTitle.trim() !== activeProject.name ||
      detailDescription.trim() !== activeProject.description ||
      detailSystemPrompt.trim() !== (activeProject.systemPrompt || '')
    )
  );

  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification((prev) => (prev === message ? null : prev));
    }, 3000);
  };

  // Función principal para GUARDAR todas las modificaciones del proyecto
  const handleSaveAllProjectChanges = (options?: { silent?: boolean }) => {
    if (!activeProject) return;
    const finalTitle = detailTitle.trim() || activeProject.name;

    setSaveStatus('saving');
    onUpdateProject(activeProject.id, {
      name: finalTitle,
      description: detailDescription.trim(),
      systemPrompt: detailSystemPrompt.trim() || undefined,
    });

    setIsEditingTitleInline(false);
    setSaveStatus('saved');

    if (!options?.silent) {
      showToast(`Proyecto "${finalTitle}" guardado correctamente.`);
    }

    setTimeout(() => {
      setSaveStatus('idle');
    }, 2500);
  };

  // Descartar modificaciones no guardadas
  const handleDiscardChanges = () => {
    if (!activeProject) return;
    setDetailTitle(activeProject.name);
    setDetailDescription(activeProject.description);
    setDetailSystemPrompt(activeProject.systemPrompt || '');
    setIsEditingTitleInline(false);
    showToast('Modificaciones descartadas.');
  };

  // Volver atrás garantizando que NUNCA se pierdan los cambios
  const handleGoBack = () => {
    if (activeProject && hasUnsavedChanges) {
      handleSaveAllProjectChanges({ silent: true });
    }
    setSelectedProjectId(null);
  };

  // Chats belonging to the active project
  const projectChats = activeProject 
    ? conversations.filter(c => c.projectId === activeProject.name || c.projectId === activeProject.id)
    : [];

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartCreate = () => {
    setNewTitle('');
    setNewDescription('');
    setNewSystemPrompt('');
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateProject({
      name: newTitle.trim(),
      description: newDescription.trim() || 'Proyecto colaborativo de BDR con contexto y archivos dedicados.',
      systemPrompt: newSystemPrompt.trim() || undefined,
      color: '#2a7b9b',
    });
    setIsCreateModalOpen(false);
  };

  const handleStartEdit = (proj: ProjectItem) => {
    setEditingProjectId(proj.id);
    setEditTitle(proj.name);
    setEditDescription(proj.description);
    setEditSystemPrompt(proj.systemPrompt || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectId || !editTitle.trim()) return;
    const finalTitle = editTitle.trim();
    onUpdateProject(editingProjectId, {
      name: finalTitle,
      description: editDescription.trim(),
      systemPrompt: editSystemPrompt.trim() || undefined,
    });
    if (activeProject && activeProject.id === editingProjectId) {
      setDetailTitle(finalTitle);
      setDetailDescription(editDescription.trim());
      setDetailSystemPrompt(editSystemPrompt.trim());
    }
    showToast(`Proyecto "${finalTitle}" actualizado y guardado.`);
    setEditingProjectId(null);
  };

  // Subida real de archivos locales (mismos formatos que en el chat: PDF, Excel, Word, imágenes, MD, etc.)
  const handleRealFileUpload = async (projectId: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: ProjectKnowledgeFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const category = getFileCategory(file);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      let textContent: string | undefined = undefined;
      // Leer texto real para ficheros .md, .txt, .csv o código
      if (['md', 'txt', 'csv', 'tsv', 'json', 'py', 'sql', 'js', 'ts', 'html', 'xml'].includes(ext) || file.type.includes('text')) {
        try {
          textContent = await file.text();
        } catch {
          // Ignorar si falla lectura de texto plano
        }
      }

      const now = new Date();
      const timeStr = `Hoy a las ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      newFiles.push({
        id: `kf-loc-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: file.size,
        type: ext || file.type || 'document',
        category: ext === 'md' ? 'code' : category,
        addedAt: timeStr,
        source: 'local',
        content: textContent,
        summary: `Documento ${category} (${ext.toUpperCase()}) integrado como conocimiento permanente.`,
      });
    }

    if (onAddKnowledgeFiles) {
      onAddKnowledgeFiles(projectId, newFiles);
    } else {
      newFiles.forEach((f) => onAddKnowledgeFile(projectId, f));
    }

    showToast(`${newFiles.length} documento(s) subido(s) y guardado(s) en el proyecto.`);

    if (knowledgeFileInputRef.current) {
      knowledgeFileInputRef.current.value = '';
    }
  };

  // Importación desde Google Drive, OneDrive o URL mediante DocumentAttachModal
  const handleAttachFromModal = (projectId: string, attachedFiles: AttachedFile[]) => {
    if (!attachedFiles || attachedFiles.length === 0) return;

    const now = new Date();
    const timeStr = `Hoy a las ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newKnowledgeFiles: ProjectKnowledgeFile[] = attachedFiles.map((af, i) => ({
      id: `kf-cloud-${Date.now()}-${i}`,
      name: af.name,
      size: af.size,
      type: af.type,
      category: af.category,
      addedAt: timeStr,
      source: af.source,
      sourceUrl: af.sourceUrl,
      summary: `Documento vinculado desde ${af.source === 'drive' ? 'Google Drive' : af.source === 'onedrive' ? 'OneDrive' : af.source === 'url' ? 'Enlace Web' : 'almacenamiento'}.`,
    }));

    if (onAddKnowledgeFiles) {
      onAddKnowledgeFiles(projectId, newKnowledgeFiles);
    } else {
      newKnowledgeFiles.forEach((f) => onAddKnowledgeFile(projectId, f));
    }

    showToast(`${newKnowledgeFiles.length} documento(s) importado(s) y guardado(s).`);
  };

  // Creación o edición de fichero Markdown (.md)
  const handleSaveMarkdownFile = (projectId: string, fileData: { name: string; content: string; fileId?: string }) => {
    const byteSize = new Blob([fileData.content]).size;
    const now = new Date();
    const timeStr = `Hoy a las ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    if (fileData.fileId) {
      // Edición de un archivo existente
      if (onUpdateKnowledgeFile) {
        onUpdateKnowledgeFile(projectId, fileData.fileId, {
          name: fileData.name,
          content: fileData.content,
          size: byteSize,
        });
      }
      showToast(`Documento Markdown "${fileData.name}" actualizado y guardado.`);
    } else {
      // Creación de un nuevo archivo .md
      const newMdFile: ProjectKnowledgeFile = {
        id: `kf-md-${Date.now()}`,
        name: fileData.name,
        size: byteSize,
        type: 'md',
        category: 'code',
        addedAt: timeStr,
        source: 'local',
        content: fileData.content,
        summary: 'Documento Markdown redactado y vinculado directamente al proyecto.',
      };

      onAddKnowledgeFile(projectId, newMdFile);
      showToast(`Nuevo archivo Markdown "${fileData.name}" guardado.`);
    }
  };

  // Drag and drop para la zona de conocimiento
  const handleKnowledgeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingKnowledge(true);
  };

  const handleKnowledgeDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingKnowledge(false);
  };

  const handleKnowledgeDrop = (projectId: string, e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingKnowledge(false);
    handleRealFileUpload(projectId, e.dataTransfer.files);
  };

  // Descarga real de archivo (para .md o con contenido)
  const handleDownloadKnowledgeFile = (file: ProjectKnowledgeFile) => {
    const contentToDownload = file.content || `Documento de Conocimiento BDR\nNombre: ${file.name}\nTipo: ${file.type}\nCategoría: ${file.category}\nRegistrado: ${file.addedAt}\n\n${file.summary || ''}`;
    const blob = new Blob([contentToDownload], { type: file.name.endsWith('.md') ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Metadatos visuales por tipo de documento
  const getKnowledgeFileInfo = (file: ProjectKnowledgeFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (file.type === 'md' || ext === 'md' || file.category === 'code') {
      return {
        icon: <FileCode className="w-4 h-4 text-[#6366f1]" />,
        badge: 'MD',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        bgClass: 'bg-indigo-50/70',
        isMarkdown: true,
      };
    }
    if (file.category === 'pdf' || ext === 'pdf') {
      return {
        icon: <FileText className="w-4 h-4 text-[#ef4444]" />,
        badge: 'PDF',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        bgClass: 'bg-red-50/60',
        isMarkdown: false,
      };
    }
    if (file.category === 'spreadsheet' || ['xlsx', 'xls', 'csv', 'tsv'].includes(ext)) {
      return {
        icon: <FileSpreadsheet className="w-4 h-4 text-[#10b981]" />,
        badge: ext ? ext.toUpperCase() : 'XLSX',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bgClass: 'bg-emerald-50/60',
        isMarkdown: false,
      };
    }
    if (file.category === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) {
      return {
        icon: <ImageIcon className="w-4 h-4 text-[#f59e0b]" />,
        badge: ext ? ext.toUpperCase() : 'IMG',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        bgClass: 'bg-amber-50/60',
        isMarkdown: false,
      };
    }
    return {
      icon: <FileText className="w-4 h-4 text-[#2a7b9b]" />,
      badge: ext ? ext.toUpperCase() : 'DOC',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      bgClass: 'bg-sky-50/60',
      isMarkdown: false,
    };
  };

  return (
    <div id="bdr-projects-view" className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* 1. Header principal de Proyectos (Claude Projects style) */}
      <div className="bg-white border-b border-[#e2e8f0] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#dcf0fa] text-[#2a7b9b] flex items-center justify-center font-bold">
              <FolderKanban className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-[#141413] tracking-tight">
              Proyectos
            </h1>
          </div>
          <p className="text-xs text-[#5e6d75] mt-1">
            Organiza tus chats, comparte contexto, instrucciones personalizadas y archivos de conocimiento específico para tu equipo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8c9ba5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2a7b9b] focus:bg-white transition"
            />
          </div>

          <button
            id="btn-create-project"
            onClick={handleStartCreate}
            className="px-3.5 py-2 rounded-xl bg-[#2a7b9b] hover:bg-[#1f5f78] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_2px_8px_rgba(42,123,155,0.22)] transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* 2. Cuerpo: Si hay un proyecto abierto en detalle o la cuadrícula principal */}
      {activeProject ? (
        // VISTA DE DETALLE DEL PROYECTO (Estilo Claude Project: Chats + Conocimiento / Archivos + Instrucciones de sistema)
        <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
          {/* Barra superior de navegación dentro del proyecto con opción de GUARDAR */}
          <div className="bg-white border-b border-[#e2e8f0] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                id="btn-back-to-projects"
                onClick={handleGoBack}
                className="text-xs text-[#5e6d75] hover:text-[#2a7b9b] font-medium flex items-center gap-1 transition group"
                title="Volver a todos los proyectos (guarda automáticamente cualquier modificación)"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                <span>Todos los proyectos</span>
              </button>
              <span className="text-[#cbd5e1]">•</span>
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: activeProject.color || '#2a7b9b' }} 
                />
                {isEditingTitleInline ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={detailTitle}
                      onChange={(e) => setDetailTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveAllProjectChanges();
                        if (e.key === 'Escape') {
                          setDetailTitle(activeProject.name);
                          setIsEditingTitleInline(false);
                        }
                      }}
                      autoFocus
                      className="px-2 py-0.5 text-sm font-bold text-[#141413] border border-[#2a7b9b] rounded-lg focus:outline-none shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveAllProjectChanges()}
                      className="p-1 rounded-md bg-[#2a7b9b] text-white hover:bg-[#1f5f78] transition"
                      title="Guardar nombre"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailTitle(activeProject.name);
                        setIsEditingTitleInline(false);
                      }}
                      className="p-1 rounded-md text-[#8c9ba5] hover:bg-[#f1f5f9] transition"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group/title">
                    <span className="text-sm font-bold text-[#141413]">
                      {detailTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitleInline(true)}
                      title="Renombrar proyecto"
                      className="p-1 text-[#8c9ba5] opacity-0 group-hover/title:opacity-100 hover:text-[#2a7b9b] transition"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Botón de Descartar si hay cambios sin guardar */}
              {hasUnsavedChanges && (
                <button
                  type="button"
                  id="btn-discard-project-changes"
                  onClick={handleDiscardChanges}
                  className="px-2.5 py-1.5 text-xs font-medium text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-xl transition flex items-center gap-1.5"
                  title="Deshacer los cambios pendientes"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Descartar</span>
                </button>
              )}

              {/* BOTÓN PRINCIPAL DE GUARDAR PROYECTO */}
              <button
                type="button"
                id="btn-save-project"
                onClick={() => handleSaveAllProjectChanges()}
                disabled={!hasUnsavedChanges && saveStatus !== 'saved'}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : hasUnsavedChanges
                    ? 'bg-[#2a7b9b] hover:bg-[#1f5f78] text-white ring-2 ring-[#2a7b9b]/25 animate-pulse'
                    : 'bg-[#f8fafc] text-[#8c9ba5] border border-[#e2e8f0] cursor-default'
                }`}
                title={hasUnsavedChanges ? 'Guardar todos los cambios del proyecto' : 'Todos los cambios están guardados'}
              >
                {saveStatus === 'saved' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Guardado!</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Save className="w-3.5 h-3.5 text-amber-200" />
                    <span>Guardar cambios</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Guardado</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleStartEdit(activeProject)}
                className="px-2.5 py-1.5 text-xs font-medium text-[#5e6d75] hover:text-[#141413] hover:bg-[#f1f5f9] rounded-xl transition flex items-center gap-1.5"
                title="Configuración de propiedades del proyecto"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Propiedades</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenProjectChat(activeProject)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#141413] text-white hover:bg-black rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Nuevo chat</span>
              </button>
            </div>
          </div>

          {/* Contenido dividido en 2 columnas: (Izquierda: Chats del Proyecto, Derecha: Contexto y Archivos de Conocimiento) */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Columna Izquierda (7 cols): Conversaciones del proyecto */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#2a7b9b]" />
                    <h2 className="text-sm font-bold text-[#141413]">
                      Conversaciones en {detailTitle} ({projectChats.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => onOpenProjectChat(activeProject)}
                    className="text-xs text-[#2a7b9b] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>+ Abrir conversación</span>
                  </button>
                </div>

                {projectChats.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#f8fafc] text-[#8c9ba5] flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-[#141413]">Aún no hay chats en este proyecto</p>
                    <p className="text-[11px] text-[#5e6d75] mt-1 max-w-sm mx-auto">
                      Cada conversación iniciada aquí utilizará automáticamente las instrucciones y los archivos cargados en este proyecto.
                    </p>
                    <button
                      onClick={() => onOpenProjectChat(activeProject)}
                      className="mt-4 px-4 py-2 bg-[#2a7b9b] text-white rounded-xl text-xs font-semibold hover:bg-[#1f5f78] transition inline-flex items-center gap-2 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Comenzar primer chat</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f1f5f9]">
                    {projectChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => onOpenProjectChat(activeProject)}
                        className="py-3 px-2 flex items-center justify-between hover:bg-[#f8fafc] rounded-xl transition cursor-pointer group"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#141413] group-hover:text-[#2a7b9b] transition">
                            {chat.title}
                          </span>
                          <span className="text-[11px] text-[#8c9ba5] mt-0.5">
                            {chat.messages.length} mensajes • {chat.date}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#8c9ba5] group-hover:text-[#2a7b9b] group-hover:translate-x-0.5 transition" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Descripción del proyecto - Editable directamente con opción de guardar */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-[#5e6d75] uppercase tracking-wider">
                    Acerca de este proyecto
                  </h3>
                  {detailDescription !== activeProject.description && (
                    <button
                      type="button"
                      onClick={() => handleSaveAllProjectChanges()}
                      className="text-[11px] font-semibold text-[#2a7b9b] hover:underline flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Guardar descripción</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={detailDescription}
                  onChange={(e) => setDetailDescription(e.target.value)}
                  placeholder="Describe los objetivos, alcance y directrices de este proyecto..."
                  className="w-full text-xs text-[#334155] leading-relaxed p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2a7b9b] focus:bg-white resize-none transition"
                />
                <div className="flex items-center justify-between mt-1 text-[10px] text-[#8c9ba5]">
                  <span>Visible en el panel del proyecto y editable en cualquier momento.</span>
                  <span>{detailDescription.length} caracteres</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha (5 cols): Archivos de Conocimiento e Instrucciones de Sistema (Estilo Claude CoWork) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Bloque: Archivos de Conocimiento del Proyecto (Archivos reales, .md y nube) */}
              <div 
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs relative ${
                  isDraggingKnowledge ? 'border-[#2a7b9b] ring-2 ring-[#2a7b9b]/30 bg-[#f0f9ff]' : 'border-[#e2e8f0]'
                }`}
                onDragOver={handleKnowledgeDragOver}
                onDragLeave={handleKnowledgeDragLeave}
                onDrop={(e) => handleKnowledgeDrop(activeProject.id, e)}
              >
                {/* Overlay visual cuando se arrastran archivos */}
                {isDraggingKnowledge && (
                  <div className="absolute inset-0 z-30 bg-[#2a7b9b]/10 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-[#2a7b9b] pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-md text-[#2a7b9b] flex items-center justify-center mb-2 animate-bounce">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-[#141413]">
                      Suelta los documentos aquí
                    </p>
                    <p className="text-[11px] text-[#5e6d75] mt-0.5">
                      PDF, Excel, Word, Markdown (.md), CSV, imágenes...
                    </p>
                  </div>
                )}

                {/* Encabezado del bloque con acciones */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#f1f5f9] gap-2.5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#2a7b9b]" />
                    <h3 className="text-xs font-bold text-[#141413]">
                      Archivos de Conocimiento ({activeProject.knowledgeFiles.length})
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Botón: Crear fichero .md */}
                    <button
                      type="button"
                      id="btn-create-md"
                      onClick={() => {
                        setEditingMarkdownFile(null);
                        setIsMarkdownModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#2a7b9b] text-white hover:bg-[#1f5f78] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
                      title="Crear un archivo Markdown (.md) editable directamente para el proyecto"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Crear .md</span>
                    </button>

                    {/* Botón: Subir archivos reales */}
                    <button
                      type="button"
                      id="btn-upload-knowledge"
                      onClick={() => knowledgeFileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-medium text-[#141413] hover:text-[#2a7b9b] hover:border-[#2a7b9b] flex items-center gap-1.5 transition"
                      title="Subir documentos desde tu equipo (PDF, Excel, Word, imágenes, MD, etc.)"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#2a7b9b]" />
                      <span>Subir archivos</span>
                    </button>

                    {/* Botón: Importar Cloud / Drive / OneDrive */}
                    <button
                      type="button"
                      id="btn-cloud-knowledge"
                      onClick={() => setIsAttachModalOpen(true)}
                      className="p-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-[#5e6d75] hover:text-[#2a7b9b] hover:border-[#2a7b9b] transition"
                      title="Importar documentos desde Google Drive, OneDrive o URL"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#5e6d75] mb-3">
                  Documentos y guías que los modelos locales usarán como contexto permanente en todas las preguntas de este proyecto.
                </p>

                {/* Filtro rápido si hay varios archivos */}
                {activeProject.knowledgeFiles.length > 3 && (
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-[#8c9ba5] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filtrar archivos del proyecto..."
                      value={knowledgeSearch}
                      onChange={(e) => setKnowledgeSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2a7b9b]"
                    />
                  </div>
                )}

                {activeProject.knowledgeFiles.length === 0 ? (
                  <div className="border border-dashed border-[#cbd5e1] hover:border-[#2a7b9b] rounded-xl p-6 text-center bg-[#f8fafc]/50 transition">
                    <div className="w-10 h-10 rounded-xl bg-[#dcf0fa] text-[#2a7b9b] flex items-center justify-center mx-auto mb-2.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-[#141413] mb-1">
                      No hay archivos de conocimiento añadidos
                    </h4>
                    <p className="text-[11px] text-[#5e6d75] max-w-sm mx-auto mb-4 leading-relaxed">
                      Sube documentos reales (PDF, Excel, Word, imágenes) o redacta ficheros Markdown (.md) para alimentar el contexto de los modelos locales.
                    </p>

                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMarkdownFile(null);
                          setIsMarkdownModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2a7b9b] text-white hover:bg-[#1f5f78] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Crear fichero .md</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => knowledgeFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#141413] hover:text-[#2a7b9b] flex items-center gap-1.5 transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#2a7b9b]" />
                        <span>Subir desde mi equipo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAttachModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-medium text-[#5e6d75] hover:text-[#2a7b9b] flex items-center gap-1.5 transition"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Drive / Cloud</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
                    {activeProject.knowledgeFiles
                      .filter((f) => f.name.toLowerCase().includes(knowledgeSearch.toLowerCase()))
                      .map((file) => {
                        const info = getKnowledgeFileInfo(file);
                        return (
                          <div
                            key={file.id}
                            className="p-2.5 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] hover:border-[#cbd5e1] flex items-center justify-between gap-3 group transition shadow-2xs"
                          >
                            <div 
                              className="flex items-center gap-2.5 truncate cursor-pointer flex-1"
                              onClick={() => {
                                if (info.isMarkdown || file.content) {
                                  setEditingMarkdownFile(file);
                                  setIsMarkdownModalOpen(true);
                                }
                              }}
                              title={info.isMarkdown || file.content ? 'Haz clic para ver y editar el contenido Markdown' : undefined}
                            >
                              <div className={`w-8 h-8 rounded-lg ${info.bgClass} border border-black/5 flex items-center justify-center shrink-0`}>
                                {info.icon}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-1.5 truncate">
                                  <p className="text-xs font-semibold text-[#141413] group-hover:text-[#2a7b9b] truncate transition">
                                    {file.name}
                                  </p>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${info.badgeClass}`}>
                                    {info.badge}
                                  </span>
                                  {file.source && file.source !== 'local' && (
                                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium capitalize shrink-0">
                                      {file.source}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[#8c9ba5] flex items-center gap-1 mt-0.5">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span>•</span>
                                  <span>{file.addedAt}</span>
                                  {(info.isMarkdown || file.content) && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[#6366f1] font-medium">Ver / editar .md</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Botón de edición para Markdown */}
                              {(info.isMarkdown || file.content) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMarkdownFile(file);
                                    setIsMarkdownModalOpen(true);
                                  }}
                                  title="Editar documento Markdown"
                                  className="p-1 rounded-lg text-[#64748b] hover:text-[#6366f1] hover:bg-indigo-50 transition"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Descarga o enlace externo */}
                              {file.sourceUrl ? (
                                <a
                                  href={file.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Abrir documento en enlace original"
                                  className="p-1 rounded-lg text-[#64748b] hover:text-[#2a7b9b] hover:bg-[#dcf0fa] transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadKnowledgeFile(file)}
                                  title="Descargar archivo"
                                  className="p-1 rounded-lg text-[#64748b] hover:text-[#2a7b9b] hover:bg-[#dcf0fa] transition"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Eliminar archivo */}
                              <button
                                type="button"
                                onClick={() => {
                                  onRemoveKnowledgeFile(activeProject.id, file.id);
                                  showToast(`"${file.name}" eliminado del proyecto.`);
                                }}
                                title="Eliminar archivo del conocimiento"
                                className="p-1 rounded-lg text-[#8c9ba5] hover:text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Bloque: Instrucciones del Sistema (Custom Instructions / Prompt de Proyecto) - Editable directamente */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2a7b9b]" />
                    <h3 className="text-xs font-bold text-[#141413]">
                      Instrucciones del sistema para el proyecto
                    </h3>
                  </div>
                  {detailSystemPrompt !== (activeProject.systemPrompt || '') && (
                    <button
                      type="button"
                      onClick={() => handleSaveAllProjectChanges()}
                      className="text-xs font-semibold text-[#2a7b9b] hover:underline flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#5e6d75] mb-2.5">
                  Define cómo deben responder los modelos locales dentro de este proyecto (rol, directrices, tono y restricciones).
                </p>

                {/* Atajos rápidos de directrices BDR */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                  <span className="text-[10px] text-[#8c9ba5] font-semibold">Atajos:</span>
                  {[
                    { label: '+ Tono analítico BDR', text: 'Mantén un tono profesional, técnico y riguroso. Prioriza exactitud y cita métricas de BDR.' },
                    { label: '+ Cumplimiento normativo', text: 'Evalúa siempre cumplimiento regulatorio, confidencialidad interna y mitigación de riesgos.' },
                    { label: '+ Respuestas ejecutivas', text: 'Estructura las respuestas con viñetas concisas y conclusiones operativas directas.' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDetailSystemPrompt((prev) => prev ? `${prev.trim()}\n\n${preset.text}` : preset.text);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[10px] text-[#475569] font-medium transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={detailSystemPrompt}
                  onChange={(e) => setDetailSystemPrompt(e.target.value)}
                  placeholder="Ej: Actúa como el asesor principal de proyectos de BDR. Responde con criterio financiero, analiza riesgos y cita los documentos de conocimiento adjuntos..."
                  className="w-full p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] text-xs text-[#334155] leading-relaxed font-mono focus:outline-none focus:border-[#2a7b9b] focus:bg-white resize-none transition"
                />

                <div className="flex items-center justify-between mt-2.5 text-[10px] text-[#8c9ba5]">
                  <span>Se inyecta automáticamente en cada mensaje de chat de este proyecto.</span>
                  <button
                    type="button"
                    onClick={() => handleSaveAllProjectChanges()}
                    className="px-2.5 py-1 bg-[#2a7b9b] text-white rounded-lg font-semibold hover:bg-[#1f5f78] transition flex items-center gap-1 shadow-2xs"
                  >
                    <Save className="w-3 h-3" />
                    <span>Guardar instrucciones</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 3. CUADRÍCULA DE PROYECTOS (Vista General)
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Tarjeta de Crear Proyecto Rápido */}
              <button
                onClick={handleStartCreate}
                className="border-2 border-dashed border-[#cbd5e1] hover:border-[#2a7b9b] rounded-2xl p-6 flex flex-col items-center justify-center text-center transition group bg-white/50 hover:bg-white shadow-2xs min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#dcf0fa] text-[#2a7b9b] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#141413] group-hover:text-[#2a7b9b] transition">
                  Crear nuevo proyecto
                </h3>
                <p className="text-xs text-[#5e6d75] mt-1 max-w-xs">
                  Crea un espacio colaborativo con archivos, chats y contexto compartidos.
                </p>
              </button>

              {/* Lista de Proyectos Existentes */}
              {filteredProjects.map((project) => {
                const countChats = conversations.filter(
                  c => c.projectId === project.name || c.projectId === project.id
                ).length;

                return (
                  <div
                    key={project.id}
                    id={`project-card-${project.id}`}
                    onClick={() => {
                      onSelectProject(project);
                      setSelectedProjectId(project.id);
                    }}
                    className="bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#2a7b9b]/50 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group min-h-[220px]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: project.color || '#2a7b9b' }}
                          />
                          <h3 className="text-sm font-bold text-[#141413] group-hover:text-[#2a7b9b] transition truncate">
                            {project.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleStartEdit(project)}
                            title="Editar proyecto"
                            className="p-1 rounded text-[#8c9ba5] hover:text-[#141413] hover:bg-[#f1f5f9] transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProject(project.id)}
                            title="Eliminar proyecto"
                            className="p-1 rounded text-[#8c9ba5] hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#5e6d75] line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#f1f5f9] mt-4 flex items-center justify-between text-[11px] text-[#8c9ba5]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium text-[#5e6d75]">
                          <MessageSquare className="w-3 h-3 text-[#2a7b9b]" />
                          {countChats} chats
                        </span>
                        <span className="flex items-center gap-1 font-medium text-[#5e6d75]">
                          <BookOpen className="w-3 h-3 text-[#2a7b9b]" />
                          {project.knowledgeFiles.length} docs
                        </span>
                      </div>
                      <span className="group-hover:text-[#2a7b9b] font-semibold flex items-center gap-0.5 transition">
                        <span>Abrir</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Crear Proyecto */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xl max-w-lg w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#2a7b9b]" />
                <h3 className="text-base font-bold text-[#141413]">Crear nuevo proyecto</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-[#8c9ba5] hover:text-[#141413] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Nombre del proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Auditoría de Seguridad Q4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#2a7b9b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Objetivos, alcance y contexto del proyecto..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#2a7b9b] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Instrucciones personalizadas (System Prompt)
                </label>
                <textarea
                  rows={3}
                  placeholder="Instrucciones para los modelos locales en este proyecto..."
                  value={newSystemPrompt}
                  onChange={(e) => setNewSystemPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#2a7b9b] resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#5e6d75] hover:bg-[#f1f5f9] transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2a7b9b] text-white text-xs font-semibold hover:bg-[#1f5f78] transition shadow-xs"
                >
                  Crear proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Proyecto */}
      {editingProjectId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xl max-w-lg w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#2a7b9b]" />
                <h3 className="text-base font-bold text-[#141413]">Editar proyecto</h3>
              </div>
              <button
                onClick={() => setEditingProjectId(null)}
                className="p-1 text-[#8c9ba5] hover:text-[#141413] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Nombre del proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#2a7b9b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#2a7b9b] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Instrucciones del sistema
                </label>
                <textarea
                  rows={3}
                  value={editSystemPrompt}
                  onChange={(e) => setEditSystemPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#2a7b9b] resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProjectId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#5e6d75] hover:bg-[#f1f5f9] transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2a7b9b] text-white text-xs font-semibold hover:bg-[#1f5f78] transition shadow-xs"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Input nativo oculto para subida de múltiples archivos locales (PDF, Excel, Word, imágenes, MD, etc.) */}
      <input
        ref={knowledgeFileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.xlsx,.xls,.csv,.tsv,.docx,.doc,.txt,.rtf,.odt,.md"
        className="hidden"
        onChange={(e) => {
          if (activeProject) {
            handleRealFileUpload(activeProject.id, e.target.files);
          }
        }}
      />

      {/* Modal para crear o editar archivos Markdown (.md) directamente */}
      {isMarkdownModalOpen && activeProject && (
        <MarkdownEditorModal
          isOpen={isMarkdownModalOpen}
          onClose={() => {
            setIsMarkdownModalOpen(false);
            setEditingMarkdownFile(null);
          }}
          initialFile={editingMarkdownFile}
          onSave={(fileData) => {
            handleSaveMarkdownFile(activeProject.id, fileData);
          }}
        />
      )}

      {/* Modal para importar documentos desde Google Drive, OneDrive o URL */}
      {isAttachModalOpen && activeProject && (
        <DocumentAttachModal
          isOpen={isAttachModalOpen}
          onClose={() => setIsAttachModalOpen(false)}
          onAttachFiles={(attached) => {
            handleAttachFromModal(activeProject.id, attached);
            setIsAttachModalOpen(false);
          }}
          title={`Añadir conocimiento a ${activeProject.name}`}
        />
      )}

      {/* Notificación Toast flotante de guardado */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn flex items-center gap-2.5 px-4 py-2.5 bg-[#141413] text-white text-xs font-medium rounded-xl shadow-xl border border-white/10">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}
    </div>
  );
};
