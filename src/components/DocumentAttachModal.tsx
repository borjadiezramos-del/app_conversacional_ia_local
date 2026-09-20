import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
  Check,
  Search,
  Folder,
  Link2,
  HardDrive,
  Cloud,
  Layers,
  ExternalLink,
  Plus
} from 'lucide-react';
import { AttachedFile, FileSource, ProjectKnowledgeFile } from '../types';
import { getFileCategory, formatFileSize } from '../data/localModels';

export interface DocumentAttachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachFiles: (files: AttachedFile[]) => void;
  title?: string;
  initialSource?: FileSource;
}

interface CloudFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  category: AttachedFile['category'];
  source: 'drive' | 'onedrive';
  updatedAt: string;
  folder: string;
  owner: string;
}

const GOOGLE_DRIVE_MOCK_FILES: CloudFileItem[] = [
  {
    id: 'gdrive-1',
    name: 'Plan_Estrategico_BDR_2026.gdoc',
    size: 430000,
    type: 'document',
    category: 'document',
    source: 'drive',
    updatedAt: 'Hace 2 horas',
    folder: 'Mi unidad / Estrategia BDR',
    owner: 'bdiez@marshals.es',
  },
  {
    id: 'gdrive-2',
    name: 'Presupuesto_Consolidado_Q3.gsheet',
    size: 1250000,
    type: 'spreadsheet',
    category: 'spreadsheet',
    source: 'drive',
    updatedAt: 'Ayer a las 18:30',
    folder: 'Unidades compartidas / Finanzas BDR',
    owner: 'Equipo Financiero',
  },
  {
    id: 'gdrive-3',
    name: 'Informe_Cumplimiento_Normativo_2026.pdf',
    size: 890000,
    type: 'pdf',
    category: 'pdf',
    source: 'drive',
    updatedAt: '12 Sep 2026',
    folder: 'Mi unidad / Legal & Compliance',
    owner: 'bdiez@marshals.es',
  },
  {
    id: 'gdrive-4',
    name: 'Presentacion_Resultados_H1_2026.gslides',
    size: 3400000,
    type: 'presentation',
    category: 'document',
    source: 'drive',
    updatedAt: '5 Sep 2026',
    folder: 'Unidades compartidas / Dirección',
    owner: 'Comité Dirección',
  },
  {
    id: 'gdrive-5',
    name: 'Directrices_Modelos_IA_Locales.gdoc',
    size: 215000,
    type: 'document',
    category: 'document',
    source: 'drive',
    updatedAt: 'Hoy a las 09:15',
    folder: 'Mi unidad / Tecnología BDR',
    owner: 'bdiez@marshals.es',
  },
  {
    id: 'gdrive-6',
    name: 'Matriz_Operaciones_SLA_Clientes.gsheet',
    size: 780000,
    type: 'spreadsheet',
    category: 'spreadsheet',
    source: 'drive',
    updatedAt: '3 Sep 2026',
    folder: 'Unidades compartidas / Operaciones',
    owner: 'Operaciones BDR',
  },
];

const ONEDRIVE_MOCK_FILES: CloudFileItem[] = [
  {
    id: 'onedrive-1',
    name: 'Contrato_Marco_Servicios_BDR.docx',
    size: 540000,
    type: 'document',
    category: 'document',
    source: 'onedrive',
    updatedAt: 'Ayer',
    folder: 'SharePoint / Legal Corporativo',
    owner: 'Asesoría Jurídica',
  },
  {
    id: 'onedrive-2',
    name: 'Modelado_Financiero_Escenarios_2026.xlsx',
    size: 2100000,
    type: 'spreadsheet',
    category: 'spreadsheet',
    source: 'onedrive',
    updatedAt: 'Hace 3 días',
    folder: 'OneDrive BDR / Controlling',
    owner: 'bdiez@marshals.es',
  },
  {
    id: 'onedrive-3',
    name: 'Procedimientos_Operativos_Estandar.pdf',
    size: 920000,
    type: 'pdf',
    category: 'pdf',
    source: 'onedrive',
    updatedAt: 'Hace 1 semana',
    folder: 'SharePoint / Calidad y Auditoría',
    owner: 'Calidad BDR',
  },
];

export const DocumentAttachModal: React.FC<DocumentAttachModalProps> = ({
  isOpen,
  onClose,
  onAttachFiles,
  title = 'Adjuntar documentos',
  initialSource = 'local',
}) => {
  const [activeTab, setActiveTab] = useState<FileSource>(initialSource);
  const [selectedCloudFileIds, setSelectedCloudFileIds] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Custom URL inputs
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  const [customLinkName, setCustomLinkName] = useState('');
  
  // Custom Drive link
  const [customDriveUrl, setCustomDriveUrl] = useState('');

  // Local drag & drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [stagedLocalFiles, setStagedLocalFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedCloudFileIds([]);
    setSearchFilter('');
    setCustomLinkUrl('');
    setCustomLinkName('');
    setCustomDriveUrl('');
    setStagedLocalFiles([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Process files selected from local system
  const handleLocalFileSelection = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newItems: AttachedFile[] = [];

    Array.from(fileList).forEach((file) => {
      const category = getFileCategory(file);
      let previewUrl: string | undefined = undefined;
      if (category === 'image') {
        previewUrl = URL.createObjectURL(file);
      }

      newItems.push({
        id: `att-loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'unknown',
        category,
        previewUrl,
        source: 'local',
      });
    });

    setStagedLocalFiles((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleLocalFileSelection(e.dataTransfer.files);
  };

  const toggleSelectCloudFile = (id: string) => {
    setSelectedCloudFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add custom Google Drive link
  const handleAddCustomDriveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDriveUrl.trim()) return;

    let docName = 'Documento Google Drive';
    if (customDriveUrl.includes('document')) docName = 'Google Doc Vinculado.gdoc';
    else if (customDriveUrl.includes('spreadsheets')) docName = 'Google Sheet Vinculado.gsheet';
    else if (customDriveUrl.includes('presentation')) docName = 'Google Slides Vinculado.gslides';
    else {
      try {
        const urlObj = new URL(customDriveUrl);
        docName = urlObj.pathname.split('/').filter(Boolean).pop() || 'Google Drive File';
      } catch {
        docName = 'Google Drive Documento';
      }
    }

    const newFile: AttachedFile = {
      id: `att-drive-${Date.now()}`,
      name: docName,
      size: 512000,
      type: 'drive-doc',
      category: docName.includes('sheet') ? 'spreadsheet' : 'document',
      source: 'drive',
      sourceUrl: customDriveUrl.trim(),
    };

    onAttachFiles([newFile]);
    handleClose();
  };

  // Add custom URL
  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLinkUrl.trim()) return;

    const file: AttachedFile = {
      id: `att-url-${Date.now()}`,
      name: customLinkName.trim() || customLinkUrl.trim().replace(/^https?:\/\//, '').slice(0, 32),
      size: 150000,
      type: 'url',
      category: 'document',
      source: 'url',
      sourceUrl: customLinkUrl.trim(),
    };

    onAttachFiles([file]);
    handleClose();
  };

  // Submit selected files based on active tab
  const handleConfirmAttach = () => {
    const filesToAttach: AttachedFile[] = [];

    if (activeTab === 'local') {
      filesToAttach.push(...stagedLocalFiles);
    } else if (activeTab === 'drive') {
      const selected = GOOGLE_DRIVE_MOCK_FILES.filter((f) =>
        selectedCloudFileIds.includes(f.id)
      );
      selected.forEach((f) => {
        filesToAttach.push({
          id: `att-${f.id}-${Date.now()}`,
          name: f.name,
          size: f.size,
          type: f.type,
          category: f.category,
          source: 'drive',
          sourceUrl: `https://drive.google.com/file/d/${f.id}`,
        });
      });
    } else if (activeTab === 'onedrive') {
      const selected = ONEDRIVE_MOCK_FILES.filter((f) =>
        selectedCloudFileIds.includes(f.id)
      );
      selected.forEach((f) => {
        filesToAttach.push({
          id: `att-${f.id}-${Date.now()}`,
          name: f.name,
          size: f.size,
          type: f.type,
          category: f.category,
          source: 'onedrive',
          sourceUrl: `https://bdr.sharepoint.com/:x:/s/${f.id}`,
        });
      });
    }

    if (filesToAttach.length > 0) {
      onAttachFiles(filesToAttach);
    }
    handleClose();
  };

  const getSourceIcon = (source: FileSource) => {
    switch (source) {
      case 'local':
        return <HardDrive className="w-4 h-4" />;
      case 'drive':
        return <Cloud className="w-4 h-4 text-emerald-600" />;
      case 'onedrive':
        return <Layers className="w-4 h-4 text-blue-600" />;
      case 'url':
        return <Link2 className="w-4 h-4 text-purple-600" />;
    }
  };

  const renderFileCategoryIcon = (category: AttachedFile['category']) => {
    switch (category) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-[#2a7b9b]" />;
      default:
        return <FileIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredDriveFiles = GOOGLE_DRIVE_MOCK_FILES.filter((f) =>
    f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.folder.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredOneDriveFiles = ONEDRIVE_MOCK_FILES.filter((f) =>
    f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.folder.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalSelectedCount =
    activeTab === 'local'
      ? stagedLocalFiles.length
      : selectedCloudFileIds.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-[#141413] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#2a7b9b]" />
              {title}
            </h3>
            <p className="text-xs text-[#5e6d75] mt-0.5">
              Importa documentos desde tu equipo local o servicios cloud corporativos de BDR.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#8c9ba5] hover:text-[#141413] hover:bg-[#f1f5f9] rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-[#e2e8f0] bg-[#f8fafc] shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              id="tab-source-local"
              onClick={() => setActiveTab('local')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'local'
                  ? 'bg-white text-[#2a7b9b] shadow-xs border border-[#e2e8f0]'
                  : 'text-[#5e6d75] hover:text-[#141413] hover:bg-white/60'
              }`}
            >
              <HardDrive className="w-4 h-4 text-[#2a7b9b]" />
              <span>Este equipo (Local)</span>
              {stagedLocalFiles.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#dcf0fa] text-[#2a7b9b] font-bold">
                  {stagedLocalFiles.length}
                </span>
              )}
            </button>

            <button
              type="button"
              id="tab-source-drive"
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'drive'
                  ? 'bg-white text-[#2a7b9b] shadow-xs border border-[#e2e8f0]'
                  : 'text-[#5e6d75] hover:text-[#141413] hover:bg-white/60'
              }`}
            >
              <div className="w-4 h-4 rounded flex items-center justify-center bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                G
              </div>
              <span>Google Drive</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 font-medium">
                Workspace
              </span>
            </button>

            <button
              type="button"
              id="tab-source-onedrive"
              onClick={() => setActiveTab('onedrive')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'onedrive'
                  ? 'bg-white text-[#2a7b9b] shadow-xs border border-[#e2e8f0]'
                  : 'text-[#5e6d75] hover:text-[#141413] hover:bg-white/60'
              }`}
            >
              <div className="w-4 h-4 rounded flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-[10px]">
                O
              </div>
              <span>OneDrive / SharePoint</span>
            </button>

            <button
              type="button"
              id="tab-source-url"
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-white text-[#2a7b9b] shadow-xs border border-[#e2e8f0]'
                  : 'text-[#5e6d75] hover:text-[#141413] hover:bg-white/60'
              }`}
            >
              <Link2 className="w-4 h-4 text-purple-600" />
              <span>Enlace URL</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: LOCAL */}
          {activeTab === 'local' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.xlsx,.xls,.csv,.tsv,.docx,.doc,.txt,.rtf,.odt,.md"
                onChange={(e) => handleLocalFileSelection(e.target.files)}
                className="hidden"
                id="doc-modal-file-input"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                  isDragOver
                    ? 'border-[#2a7b9b] bg-[#dcf0fa]/40'
                    : 'border-[#cbd5e1] hover:border-[#2a7b9b] bg-[#fafafa] hover:bg-[#f8fafc]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#dcf0fa] text-[#2a7b9b] flex items-center justify-center mb-3 shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#141413]">
                  Haz clic para examinar o arrastra archivos aquí
                </h4>
                <p className="text-xs text-[#5e6d75] mt-1 max-w-sm">
                  Admite documentos PDF, hojas de cálculo (Excel, CSV), documentos Word (DOCX), imágenes y notas Markdown/Texto.
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-1.5 rounded-xl bg-white border border-[#cbd5e1] text-[#141413] text-xs font-semibold hover:bg-[#f1f5f9] shadow-2xs transition"
                >
                  Seleccionar archivos locales
                </button>
              </div>

              {/* List of staged local files */}
              {stagedLocalFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#141413]">
                      Archivos listos para adjuntar ({stagedLocalFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setStagedLocalFiles([])}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Quitar todos
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {stagedLocalFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {renderFileCategoryIcon(file.category)}
                          <div className="truncate">
                            <span className="font-semibold text-[#141413] block truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-[#5e6d75]">
                              {formatFileSize(file.size)} • {file.type}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStagedLocalFiles((prev) =>
                              prev.filter((item) => item.id !== file.id)
                            );
                          }}
                          className="p-1 text-[#8c9ba5] hover:text-red-600 rounded transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              {/* Connected account banner */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Google Workspace BDR Conectado
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      bdiez@marshals.es • Marshals / BDR Drive
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Activo
                </span>
              </div>

              {/* Search drive */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8c9ba5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar en Google Drive corporativo..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2a7b9b] focus:bg-white transition"
                />
              </div>

              {/* Drive files list */}
              <div className="border border-[#e2e8f0] rounded-xl overflow-hidden divide-y divide-[#f1f5f9] max-h-56 overflow-y-auto">
                {filteredDriveFiles.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#5e6d75]">
                    No se encontraron documentos en Google Drive con ese criterio.
                  </div>
                ) : (
                  filteredDriveFiles.map((file) => {
                    const isSelected = selectedCloudFileIds.includes(file.id);
                    return (
                      <div
                        key={file.id}
                        onClick={() => toggleSelectCloudFile(file.id)}
                        className={`flex items-center justify-between p-2.5 px-3.5 transition cursor-pointer select-none text-xs ${
                          isSelected
                            ? 'bg-[#dcf0fa]/50 hover:bg-[#dcf0fa]/70'
                            : 'hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent onClick
                            className="w-4 h-4 rounded text-[#2a7b9b] focus:ring-0 cursor-pointer"
                          />
                          {renderFileCategoryIcon(file.category)}
                          <div className="truncate">
                            <span className="font-semibold text-[#141413] block truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-[#5e6d75] flex items-center gap-1">
                              <Folder className="w-2.5 h-2.5" />
                              {file.folder} • {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#8c9ba5] shrink-0 ml-2">
                          {file.updatedAt}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Attach directly via Google Drive Link */}
              <div className="pt-2 border-t border-[#f1f5f9]">
                <form onSubmit={handleAddCustomDriveLink} className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#5e6d75]">
                    ¿Tienes el enlace de un documento o carpeta de Google Drive?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://docs.google.com/document/d/... o drive.google.com"
                      value={customDriveUrl}
                      onChange={(e) => setCustomDriveUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2a7b9b]"
                    />
                    <button
                      type="submit"
                      disabled={!customDriveUrl.trim()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                      Añadir enlace
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: MICROSOFT ONEDRIVE / SHAREPOINT */}
          {activeTab === 'onedrive' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-950 block">
                      Microsoft 365 SharePoint / OneDrive BDR
                    </span>
                    <span className="text-[11px] text-blue-700">
                      Sitio corporativo BDR Cloud
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                  Conectado
                </span>
              </div>

              {/* Search OneDrive */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8c9ba5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar en OneDrive y SharePoint..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2a7b9b] focus:bg-white transition"
                />
              </div>

              <div className="border border-[#e2e8f0] rounded-xl overflow-hidden divide-y divide-[#f1f5f9] max-h-56 overflow-y-auto">
                {filteredOneDriveFiles.map((file) => {
                  const isSelected = selectedCloudFileIds.includes(file.id);
                  return (
                    <div
                      key={file.id}
                      onClick={() => toggleSelectCloudFile(file.id)}
                      className={`flex items-center justify-between p-2.5 px-3.5 transition cursor-pointer select-none text-xs ${
                        isSelected
                          ? 'bg-blue-50 hover:bg-blue-100/60'
                          : 'hover:bg-[#f8fafc]'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        {renderFileCategoryIcon(file.category)}
                        <div className="truncate">
                          <span className="font-semibold text-[#141413] block truncate">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-[#5e6d75] flex items-center gap-1">
                            <Folder className="w-2.5 h-2.5" />
                            {file.folder} • {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#8c9ba5] shrink-0 ml-2">
                        {file.updatedAt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: WEB URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleAddCustomUrl} className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                Añade un enlace directo a un documento en la web, informe público o repositorio de documentación.
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  URL del documento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-[#8c9ba5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="url"
                    required
                    placeholder="https://ejemplo.com/informe-tecnico.pdf"
                    value={customLinkUrl}
                    onChange={(e) => setCustomLinkUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2a7b9b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Nombre descriptivo (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Manual de Arquitectura Cloud"
                  value={customLinkName}
                  onChange={(e) => setCustomLinkName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2a7b9b]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!customLinkUrl.trim()}
                  className="px-4 py-2 rounded-xl bg-[#2a7b9b] text-white text-xs font-semibold hover:bg-[#1f5f78] disabled:opacity-50 transition"
                >
                  Vincular documento Web
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#5e6d75]">
            {totalSelectedCount > 0 ? (
              <span className="font-semibold text-[#141413]">
                {totalSelectedCount} documento{totalSelectedCount > 1 ? 's' : ''} seleccionado{totalSelectedCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span>Selecciona documentos para adjuntar</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#5e6d75] hover:bg-[#e2e8f0] transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              id="btn-confirm-attach-docs"
              onClick={handleConfirmAttach}
              disabled={totalSelectedCount === 0}
              className="px-4 py-2 rounded-xl bg-[#2a7b9b] text-white text-xs font-semibold hover:bg-[#1f5f78] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Adjuntar seleccionados ({totalSelectedCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
