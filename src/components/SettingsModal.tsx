import React, { useState } from 'react';
import { STREAMLIT_CONFIG_TOML } from '../data/mockArtifacts';
import { X, Check, Copy, Settings, Palette, Sliders, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'layout' | 'config'>('theme');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(STREAMLIT_CONFIG_TOML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id="modal-bdr-settings-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 animate-fadeIn"
    >
      <div 
        id="modal-bdr-settings-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] flex flex-col overflow-hidden animate-scaleUp"
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f5f5f5]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#2a7b9b] flex items-center justify-center text-white shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#141413] flex items-center gap-2">
                Configuración del Sistema BDR
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#dcf0fa] text-[#2a7b9b] font-semibold">
                  Activo
                </span>
              </h2>
              <p className="text-xs text-[#5e6d75]">
                Parámetros visuales, entorno de ejecución y preferencias del sistema
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            className="p-1.5 text-[#5e6d75] hover:text-[#141413] hover:bg-[#e2e8f0] rounded-lg transition"
            title="Cerrar configuración"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center px-6 pt-3 border-b border-[#e2e8f0] bg-white gap-2">
          <button
            id="tab-settings-theme"
            onClick={() => setActiveTab('theme')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'theme'
                ? 'border-[#2a7b9b] text-[#2a7b9b]'
                : 'border-transparent text-[#5e6d75] hover:text-[#141413]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Tema y Marca</span>
          </button>
          <button
            id="tab-settings-layout"
            onClick={() => setActiveTab('layout')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'layout'
                ? 'border-[#2a7b9b] text-[#2a7b9b]'
                : 'border-transparent text-[#5e6d75] hover:text-[#141413]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Disposición y Lectura</span>
          </button>
          <button
            id="tab-settings-config"
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'config'
                ? 'border-[#2a7b9b] text-[#2a7b9b]'
                : 'border-transparent text-[#5e6d75] hover:text-[#141413]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Parámetros del Servidor</span>
          </button>
        </div>

        {/* Contenido de la Configuración */}
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-white space-y-6">
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#5e6d75] uppercase tracking-wider">
                Paleta Corporativa Oficial BDR
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-[#e2e8f0] bg-white flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-[#2a7b9b] shadow-xs mb-2 border border-black/5" />
                  <span className="text-xs font-bold text-[#141413]">Primario</span>
                  <span className="text-[11px] font-mono text-[#2a7b9b]">#2a7b9b</span>
                </div>
                <div className="p-3 rounded-xl border border-[#e2e8f0] bg-white flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] shadow-xs mb-2 border border-black/10" />
                  <span className="text-xs font-bold text-[#141413]">Fondo</span>
                  <span className="text-[11px] font-mono text-[#5e6d75]">#f5f5f5</span>
                </div>
                <div className="p-3 rounded-xl border border-[#e2e8f0] bg-white flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-[#dcf0fa] shadow-xs mb-2 border border-[#2a7b9b]/20" />
                  <span className="text-xs font-bold text-[#141413]">Secundario</span>
                  <span className="text-[11px] font-mono text-[#2a7b9b]">#dcf0fa</span>
                </div>
                <div className="p-3 rounded-xl border border-[#e2e8f0] bg-white flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-[#141413] shadow-xs mb-2 border border-black/5" />
                  <span className="text-xs font-bold text-[#141413]">Texto</span>
                  <span className="text-[11px] font-mono text-[#5e6d75]">#141413</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#dcf0fa]/40 border border-[#2a7b9b]/20 text-xs text-[#141413] space-y-1">
                <span className="font-semibold text-[#2a7b9b] block">Tipografía Corporativa</span>
                <p className="text-[#5e6d75]">
                  Sistema tipográfico sans-serif normalizado (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto) con ratios de contraste WCAG AA aplicados.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#5e6d75] uppercase tracking-wider">
                Estructura de la Interfaz
              </h3>
              
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-[#e2e8f0] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#141413]">Ancho Máximo Contenido</h4>
                    <p className="text-[11px] text-[#5e6d75]">Restringe el chat a 800px para evitar dispersión visual</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#dcf0fa] text-[#2a7b9b]">
                    800px fijado
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#e2e8f0] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#141413]">Barra Lateral de Navegación</h4>
                    <p className="text-[11px] text-[#5e6d75]">Gestión de proyectos, chats fijados e historial</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#dcf0fa] text-[#2a7b9b]">
                    Nativo st.sidebar
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#e2e8f0] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#141413]">Caja de Entrada Flotante</h4>
                    <p className="text-[11px] text-[#5e6d75]">Bordes redondeados de 18px con sombra de elevación BDR</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#dcf0fa] text-[#2a7b9b]">
                    Activo
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#5e6d75] uppercase tracking-wider">
                  Archivo .streamlit/config.toml
                </h3>
                <button
                  id="btn-copy-config-toml"
                  onClick={handleCopyConfig}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#2a7b9b] bg-[#dcf0fa] hover:bg-[#c9e8f7] transition flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2a7b9b]" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar TOML</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#141413] text-[#dcf0fa] font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                <code>{STREAMLIT_CONFIG_TOML}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-3.5 border-t border-[#e2e8f0] bg-[#fafafa] flex items-center justify-between">
          <span className="text-[11px] text-[#5e6d75]">
            BDR Enterprise Configuration Engine
          </span>
          <button
            id="btn-confirm-settings"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#2a7b9b] hover:bg-[#1f5f78] text-white text-xs font-semibold transition shadow-xs"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
