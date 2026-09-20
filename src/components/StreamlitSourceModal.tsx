import React, { useState } from 'react';
import { STREAMLIT_FILES } from '../data/mockArtifacts';
import { X, Check, Copy, Download, FileCode, Terminal, Layers } from 'lucide-react';

interface StreamlitSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreamlitSourceModal: React.FC<StreamlitSourceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFile = STREAMLIT_FILES[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#f5f5f5]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#2a7b9b] flex items-center justify-center text-white shadow-xs">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Entregables de Código Streamlit (Python + TOML)
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#dcf0fa] text-[#2a7b9b] font-semibold">
                  Sistema BDR
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Archivos listos para ejecutar localmente con arquitectura Sidebar + Chat Central (800px max-width)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selectors & Action Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-white border-b border-slate-200 gap-3">
          <div className="flex items-center space-x-2">
            {STREAMLIT_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => {
                  setActiveTab(idx);
                  setCopied(false);
                }}
                className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === idx
                    ? 'bg-[#2a7b9b] text-white shadow-xs'
                    : 'bg-[#f5f5f5] text-slate-600 hover:bg-[#dcf0fa] hover:text-[#2a7b9b]'
                }`}
              >
                <span>{file.name === 'config.toml' ? '⚙️' : '🐍'}</span>
                <span>{file.path}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2a7b9b] text-white hover:bg-[#1f5f78] transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar {currentFile.name}</span>
            </button>
          </div>
        </div>

        {/* Description & Specs Banner */}
        <div className="px-6 py-2 bg-[#dcf0fa]/50 border-b border-[#2a7b9b]/15 text-xs text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#2a7b9b]" />
            <strong>Especificación:</strong> {currentFile.description}
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            {currentFile.content.split('\n').length} líneas
          </span>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 overflow-auto bg-[#141413] p-4 text-slate-200 font-mono text-xs leading-relaxed">
          <pre className="select-text">
            <code>{currentFile.content}</code>
          </pre>
        </div>

        {/* Execution Guidance Footer */}
        <div className="px-6 py-3 bg-[#f5f5f5] border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#2a7b9b]" />
            <span>
              Para ejecutar en tu máquina:&nbsp;
              <code className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-slate-800 font-semibold">
                streamlit run app.py
              </code>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
