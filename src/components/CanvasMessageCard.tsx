import React, { useState } from 'react';
import {
  FileText,
  Code2,
  ExternalLink,
  Copy,
  Check,
  Download,
  Edit3
} from 'lucide-react';
import { CanvasDocument } from '../types';

interface CanvasMessageCardProps {
  document: CanvasDocument;
  onOpenCanvas: (doc: CanvasDocument) => void;
}

export const CanvasMessageCard: React.FC<CanvasMessageCardProps> = ({
  document,
  onOpenCanvas,
}) => {
  const [copied, setCopied] = useState(false);
  const isCode = document.type === 'code' || document.type === 'html';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    let ext = 'txt';
    let mime = 'text/plain';
    if (isCode) {
      const l = document.language?.toLowerCase() || 'txt';
      if (l.includes('python') || l === 'py') ext = 'py';
      else if (l.includes('typescript') || l === 'ts' || l === 'tsx') ext = 'tsx';
      else if (l.includes('javascript') || l === 'js') ext = 'js';
      else if (l.includes('html')) { ext = 'html'; mime = 'text/html'; }
      else ext = l;
    } else if (document.type === 'markdown') {
      ext = 'md';
      mime = 'text/markdown';
    }

    const blob = new Blob([document.content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title.toLowerCase().replace(/\s+/g, '_')}_v${document.version}.${ext}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Preview de las primeras 4 líneas
  const previewSnippet = document.content
    .split('\n')
    .slice(0, 4)
    .join('\n');

  return (
    <div
      onClick={() => onOpenCanvas(document)}
      className="mt-3 bg-white border border-[#cbd5e1] hover:border-[#2a7b9b] rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
              isCode ? 'bg-[#059669]' : 'bg-[#2a7b9b]'
            }`}
          >
            {isCode ? <Code2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#141413] group-hover:text-[#2a7b9b] transition">
                {document.title}
              </span>
              <span className="text-[10px] bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.2 rounded font-mono">
                v{document.version}
              </span>
            </div>
            <span className="text-[10px] text-[#8c9ba5]">
              {isCode ? `Código ${document.language || 'script'}` : 'Documento Canva interactivo'} • Editable en tiempo real
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Copiar contenido"
            className="p-1.5 text-[#64748b] hover:text-[#141413] hover:bg-[#f1f5f9] rounded-lg transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            title="Descargar archivo"
            className="p-1.5 text-[#64748b] hover:text-[#141413] hover:bg-[#f1f5f9] rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <div className="px-2.5 py-1 bg-[#2a7b9b] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs group-hover:bg-[#1f5f78] transition">
            <Edit3 className="w-3 h-3" />
            <span>Abrir {isCode ? 'Code' : 'Canva'}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </div>
        </div>
      </div>

      {/* Snippet preview */}
      <div className="mt-2.5 p-2 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] text-[11px] text-[#475569] font-mono overflow-hidden max-h-20 whitespace-pre">
        {previewSnippet}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-[#8c9ba5]">
        <span>Haz clic para abrir el panel lateral y editar el contenido</span>
        <span>{document.content.length} caracteres</span>
      </div>
    </div>
  );
};
