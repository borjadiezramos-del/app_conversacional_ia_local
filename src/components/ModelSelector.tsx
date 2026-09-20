import React, { useState } from 'react';
import { Cpu, Plus, Check, ChevronDown, Sparkles, Trash2, Server } from 'lucide-react';
import { LocalModel } from '../types';

interface ModelSelectorProps {
  models: LocalModel[];
  selectedModel: LocalModel;
  onSelectModel: (model: LocalModel) => void;
  onAddModel: (model: LocalModel) => void;
  onRemoveModel?: (id: string) => void;
  variant?: 'standard' | 'pill-dark' | 'pill-light';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  onAddModel,
  onRemoveModel,
  variant = 'standard',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelTag, setNewModelTag] = useState('Local Ollama');

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;

    const newId = `custom-${Date.now()}`;
    const modelObj: LocalModel = {
      id: newId,
      name: newModelName.trim(),
      tag: newModelTag.trim() || 'Local',
      description: 'Modelo local configurado por el usuario',
      size: 'Local',
      isCustom: true,
    };

    onAddModel(modelObj);
    onSelectModel(modelObj);
    setNewModelName('');
    setIsAdding(false);
    setIsOpen(false);
  };

  const isDark = variant === 'pill-dark';
  const isPillLight = variant === 'pill-light';

  return (
    <div className="relative">
      {isDark ? (
        <button
          id="btn-select-model-dropdown"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition cursor-pointer select-none"
          title="Cambiar modelo local"
        >
          <span className="font-medium text-white/95 max-w-[100px] sm:max-w-[140px] truncate">
            {selectedModel.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-white/60 shrink-0" />
        </button>
      ) : isPillLight ? (
        <button
          id="btn-select-model-dropdown"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#141413] hover:bg-[#f1f5f9] border border-[#cbd5e1] transition cursor-pointer select-none"
          title="Cambiar modelo local"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-medium text-[#141413] max-w-[100px] sm:max-w-[140px] truncate">
            {selectedModel.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#5e6d75] shrink-0" />
        </button>
      ) : (
        <button
          id="btn-select-model-dropdown"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#f8fafc] text-[#141413] border border-[#e2e8f0] shadow-xs transition cursor-pointer"
          title="Seleccionar modelo instalado en local"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Cpu className="w-3.5 h-3.5 text-[#2a7b9b]" />
          <span className="font-bold text-[#141413] max-w-[130px] sm:max-w-[180px] truncate">
            {selectedModel.name}
          </span>
          <ChevronDown className="w-3 h-3 text-[#5e6d75] shrink-0" />
        </button>
      )}

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => { setIsOpen(false); setIsAdding(false); }}
          />
          <div className={`absolute right-0 sm:right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-1.5 w-72 sm:w-80 rounded-2xl border shadow-2xl z-40 py-2 animate-fadeIn ${
            isDark ? 'bg-[#1e1f20] border-white/10 text-white' : 'bg-white border-[#e2e8f0] text-[#141413]'
          }`}>
            <div className={`px-3.5 py-2 border-b flex items-center justify-between ${
              isDark ? 'border-white/10' : 'border-[#f1f5f9]'
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Server className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Modelos instalados en local</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isDark ? 'bg-white/10 text-white/70' : 'text-[#5e6d75] bg-[#f1f5f9]'
              }`}>
                Ollama / vLLM
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {models.map((m) => {
                const isSelected = m.id === selectedModel.id;
                return (
                  <div
                    key={m.id}
                    className={`px-3.5 py-2 flex items-center justify-between text-xs cursor-pointer transition ${
                      isSelected 
                        ? isDark 
                          ? 'bg-white/15 text-white font-medium' 
                          : 'bg-[#dcf0fa]/50 text-[#2a7b9b]' 
                        : isDark
                          ? 'text-white/80 hover:bg-white/10 hover:text-white'
                          : 'text-[#141413] hover:bg-[#f8fafc]'
                    }`}
                    onClick={() => {
                      onSelectModel(m);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex flex-col flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{m.name}</span>
                        {m.size && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isDark ? 'bg-white/10 text-white/70' : 'text-[#5e6d75] bg-[#f1f5f9]'
                          }`}>
                            {m.size}
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] mt-0.5 ${
                        isDark ? 'text-white/50' : 'text-[#5e6d75]'
                      }`}>
                        {m.description || m.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#38bdf8]" />
                      )}
                      {m.isCustom && onRemoveModel && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveModel(m.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-400 rounded"
                          title="Eliminar modelo personalizado"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`pt-2 px-3 border-t ${
              isDark ? 'border-white/10' : 'border-[#f1f5f9]'
            }`}>
              {!isAdding ? (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isDark ? 'text-[#38bdf8] hover:bg-white/10' : 'text-[#2a7b9b] hover:bg-[#dcf0fa]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir modelo local (ej. Llama, Gemma, etc.)</span>
                </button>
              ) : (
                <form onSubmit={handleAddNew} className="space-y-2 pt-1 pb-1">
                  <div className="text-[11px] font-semibold">
                    Nombre del modelo local (Ollama / GGUF / vLLM):
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="ej: llama3.1:8b, mistral:7b, gemma2:9b"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    className={`w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                      isDark 
                        ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-[#38bdf8]' 
                        : 'border-[#e2e8f0] text-[#141413] focus:border-[#2a7b9b]'
                    }`}
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className={`px-2.5 py-1 text-xs rounded-md ${
                        isDark ? 'text-white/60 hover:bg-white/10' : 'text-[#5e6d75] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold bg-[#2a7b9b] text-white rounded-md hover:bg-[#1f5f78]"
                    >
                      Guardar modelo
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
