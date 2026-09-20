import React, { useState } from 'react';
import { Globe, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, FileText } from 'lucide-react';
import { WebSearchMeta } from '../types';

interface WebSourcesCardProps {
  webSearch: WebSearchMeta;
}

export const WebSourcesCard: React.FC<WebSourcesCardProps> = ({ webSearch }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { results, query, scrapedUrl, executedAt } = webSearch;

  if (!results || (results.length === 0 && !scrapedUrl)) {
    return null;
  }

  return (
    <div className="mb-3.5 rounded-2xl border border-[#cbd5e1] bg-white overflow-hidden shadow-sm transition-all">
      {/* Cabecera del panel de fuentes web */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between cursor-pointer hover:bg-[#f1f5f9] transition select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#dcf0fa] text-[#2a7b9b] flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#141413]">
                Búsqueda Web en Vivo
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#dcf0fa] text-[#2a7b9b] border border-[#2a7b9b]/20 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#2a7b9b]" />
                {results.length} {results.length === 1 ? 'fuente' : 'fuentes'}
              </span>
            </div>
            <p className="text-[11px] text-[#5e6d75] truncate max-w-[280px] sm:max-w-md">
              Consulta: &ldquo;{query}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-[#94a3b8] hidden sm:inline">
            {executedAt}
          </span>
          <button
            type="button"
            className="p-1 text-[#64748b] hover:text-[#141413] rounded transition"
            aria-label={isExpanded ? 'Ocultar fuentes' : 'Mostrar fuentes'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Contenido desplegable: lista de fuentes */}
      {isExpanded && (
        <div className="p-3 space-y-2 bg-white">
          {scrapedUrl && (
            <div className="p-2.5 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#0284c7] mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#0369a1] flex items-center gap-1">
                  <span>Página web analizada directamente</span>
                </div>
                <a 
                  href={scrapedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#0284c7] hover:underline flex items-center gap-1 truncate mt-0.5"
                >
                  <span className="truncate">{scrapedUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {results.map((item, idx) => (
              <a
                key={item.id || idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 rounded-xl border border-[#e2e8f0] hover:border-[#2a7b9b] hover:bg-[#f8fafc] transition flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-4 h-4 rounded-full bg-[#e2e8f0] group-hover:bg-[#dcf0fa] text-[#475569] group-hover:text-[#2a7b9b] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-medium text-[#64748b] truncate group-hover:text-[#2a7b9b]">
                      {item.domain}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#94a3b8] group-hover:text-[#2a7b9b] ml-auto shrink-0 transition" />
                  </div>
                  <h4 className="text-xs font-semibold text-[#141413] group-hover:text-[#2a7b9b] line-clamp-1 transition">
                    {item.title}
                  </h4>
                  {item.snippet && (
                    <p className="text-[11px] text-[#5e6d75] line-clamp-2 mt-1 leading-relaxed">
                      {item.snippet}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
