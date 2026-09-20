import React, { useRef, useState, useEffect } from 'react';
import { 
  Paperclip, 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  X, 
  File as FileIcon,
  UploadCloud,
  HardDrive,
  Cloud,
  Layers,
  Link2,
  ChevronUp
} from 'lucide-react';
import { AttachedFile, FileSource } from '../types';
import { getFileCategory, formatFileSize } from '../data/localModels';
import { DocumentAttachModal } from './DocumentAttachModal';

interface FileUploadZoneProps {
  attachments: AttachedFile[];
  onAddAttachments: (files: AttachedFile[]) => void;
  onRemoveAttachment: (id: string) => void;
  disabled?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialSource, setModalInitialSource] = useState<FileSource>('local');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: AttachedFile[] = [];
    Array.from(fileList).forEach((file) => {
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

    onAddAttachments(newItems);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleOpenSourceModal = (source: FileSource) => {
    setIsMenuOpen(false);
    setModalInitialSource(source);
    setIsModalOpen(true);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Hidden native input with multiple formats */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.xlsx,.xls,.csv,.tsv,.docx,.doc,.txt,.rtf,.odt,.md"
        onChange={handleFileChange}
        className="hidden"
        id="chat-file-uploader-input"
        disabled={disabled}
      />

      {/* Button to toggle attachment source menu */}
      <button
        type="button"
        id="btn-attach-document"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        disabled={disabled}
        title="Adjuntar documentos (Local, Google Drive, OneDrive, etc.)"
        className={`p-2 sm:p-2.5 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isMenuOpen
            ? 'bg-[#2a7b9b] text-white shadow-xs'
            : 'text-[#5e6d75] hover:text-[#2a7b9b] hover:bg-[#dcf0fa]'
        }`}
      >
        <Paperclip className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </button>

      {/* Attachment Source Popover Menu */}
      {isMenuOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl p-1.5 z-50 animate-fadeIn divide-y divide-[#f1f5f9]">
          <div className="p-1 space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">
              Origen de documentos
            </div>

            {/* 1. Subir desde este equipo */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#141413] hover:bg-[#f1f5f9] transition text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#dcf0fa] text-[#2a7b9b] flex items-center justify-center shrink-0">
                <HardDrive className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="block font-semibold">Este equipo</span>
                <span className="block text-[10px] text-[#5e6d75] font-normal truncate">
                  PDF, Excel, Word, Imágenes
                </span>
              </div>
            </button>

            {/* 2. Google Drive */}
            <button
              type="button"
              onClick={() => handleOpenSourceModal('drive')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#141413] hover:bg-[#f1f5f9] transition text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200/60">
                G
              </div>
              <div className="truncate">
                <span className="block font-semibold flex items-center gap-1.5">
                  Google Drive
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                    BDR
                  </span>
                </span>
                <span className="block text-[10px] text-[#5e6d75] font-normal truncate">
                  Docs, Sheets, Slides, PDFs
                </span>
              </div>
            </button>

            {/* 3. OneDrive / SharePoint */}
            <button
              type="button"
              onClick={() => handleOpenSourceModal('onedrive')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#141413] hover:bg-[#f1f5f9] transition text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200/60">
                O
              </div>
              <div className="truncate">
                <span className="block font-semibold">OneDrive / SharePoint</span>
                <span className="block text-[10px] text-[#5e6d75] font-normal truncate">
                  Microsoft 365 corporativo
                </span>
              </div>
            </button>

            {/* 4. Enlace Web */}
            <button
              type="button"
              onClick={() => handleOpenSourceModal('url')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#141413] hover:bg-[#f1f5f9] transition text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60">
                <Link2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="block font-semibold">Enlace web / URL</span>
                <span className="block text-[10px] text-[#5e6d75] font-normal truncate">
                  Vincular documento por enlace
                </span>
              </div>
            </button>
          </div>

          <div className="p-1">
            <button
              type="button"
              onClick={() => handleOpenSourceModal('local')}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-[#2a7b9b] hover:bg-[#dcf0fa]/60 transition cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Explorador completo...</span>
            </button>
          </div>
        </div>
      )}

      {/* Reusable Document Attachment Modal */}
      <DocumentAttachModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSource={modalInitialSource}
        onAttachFiles={(files) => {
          onAddAttachments(files);
        }}
        title="Adjuntar al Chat"
      />
    </div>
  );
};

export const AttachmentBadgeList: React.FC<{
  attachments: AttachedFile[];
  onRemoveAttachment?: (id: string) => void;
  readOnly?: boolean;
}> = ({ attachments, onRemoveAttachment, readOnly = false }) => {
  if (!attachments || attachments.length === 0) return null;

  const getCategoryColor = (cat: AttachedFile['category']) => {
    switch (cat) {
      case 'pdf':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'spreadsheet':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'image':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'document':
        return 'bg-sky-50 border-sky-200 text-sky-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const renderSourceBadge = (source?: FileSource) => {
    switch (source) {
      case 'drive':
        return (
          <span className="shrink-0 text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
            Drive
          </span>
        );
      case 'onedrive':
        return (
          <span className="shrink-0 text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
            OneDrive
          </span>
        );
      case 'url':
        return (
          <span className="shrink-0 text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
            Web
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-1 pb-1">
      {attachments.map((att) => (
        <div
          key={att.id}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs shadow-xs font-medium max-w-[280px] sm:max-w-[340px] ${getCategoryColor(
            att.category
          )}`}
        >
          {att.previewUrl ? (
            <img
              src={att.previewUrl}
              alt={att.name}
              className="w-5 h-5 object-cover rounded shrink-0 border border-black/10"
            />
          ) : (
            <span className="shrink-0 font-bold uppercase text-[9px] px-1 py-0.5 rounded bg-white/70">
              {att.type.slice(0, 4)}
            </span>
          )}

          <div className="flex flex-col truncate flex-1 min-w-0">
            <span className="truncate font-semibold text-[#141413] leading-tight flex items-center gap-1">
              <span className="truncate">{att.name}</span>
            </span>
            <span className="text-[10px] opacity-75 leading-tight flex items-center gap-1">
              {formatFileSize(att.size)}
              {renderSourceBadge(att.source)}
            </span>
          </div>

          {!readOnly && onRemoveAttachment && (
            <button
              type="button"
              onClick={() => onRemoveAttachment(att.id)}
              className="ml-1 p-0.5 rounded hover:bg-black/10 text-slate-500 hover:text-slate-800 transition shrink-0"
              title="Quitar archivo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

