import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Sparkles, Terminal, CornerDownLeft, Paperclip, Bot, User } from 'lucide-react';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isGenerating?: boolean;
}

const QUICK_PROMPTS = [
  'generar dashboard',
  'crear reporte de ventas BDR',
  'añadir gráfico de métricas',
  'formulario interactivo BDR',
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isGenerating = false,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
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

  const handleQuickPrompt = (prompt: string) => {
    if (isGenerating) return;
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5] p-3 sm:p-4 overflow-hidden border-r border-slate-200/80">
      {/* Panel Subheader / Brand Badge */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2a7b9b] flex items-center justify-center text-white font-bold text-xs shadow-xs tracking-wider">
            BDR
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#141413]">Chat Conversacional</h2>
            <p className="text-[11px] text-slate-500">
              Anclaje en st.session_state
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#dcf0fa] text-[#2a7b9b] border border-[#2a7b9b]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2a7b9b] mr-1.5 animate-pulse"></span>
          Conectado
        </span>
      </div>

      {/* Message History List (Scroll independiente) */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 pt-1">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isAssistant ? 'justify-start' : 'justify-end'
              }`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-[#2a7b9b] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[84%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                  isAssistant
                    ? 'bg-white text-[#141413] border border-slate-200/80 rounded-tl-xs'
                    : 'bg-[#dcf0fa] text-[#141413] border border-[#2a7b9b]/25 rounded-tr-xs font-normal'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div
                  className={`mt-1.5 text-[10px] flex items-center gap-1 ${
                    isAssistant ? 'text-slate-400' : 'text-[#2a7b9b]/70 justify-end'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.artifactId && (
                    <span className="ml-1 inline-flex items-center font-medium text-[#2a7b9b] bg-white/70 px-1.5 py-0.2 rounded border border-[#2a7b9b]/20">
                      ⚡ Artefacto Actualizado
                    </span>
                  )}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-start gap-2.5 animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-[#2a7b9b] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-500 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2a7b9b] animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-[#2a7b9b] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#2a7b9b] animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1 text-[#2a7b9b] font-medium">BDR AI procesando artefacto...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugerencias Rápidas / Pills */}
      <div className="pt-2 pb-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#2a7b9b]" />
          Sugerencias:
        </span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleQuickPrompt(prompt)}
            className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-full bg-white hover:bg-[#dcf0fa] text-slate-700 hover:text-[#2a7b9b] border border-slate-200 hover:border-[#2a7b9b]/40 transition shadow-2xs cursor-pointer"
          >
            {prompt === 'generar dashboard' ? '✨ ' + prompt : prompt}
          </button>
        ))}
      </div>

      {/* Floating Chat Input Box (Especificación st.chat_input con tarjeta flotante CSS) */}
      <div className="pt-1">
        <form
          onSubmit={handleSubmit}
          className="relative bg-white rounded-2xl border-1.5 border-[#dcf0fa] focus-within:border-[#2a7b9b] shadow-[0_8px_24px_rgba(42,123,155,0.12)] p-2 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje o 'generar dashboard'..."
            rows={1}
            disabled={isGenerating}
            className="w-full resize-none border-none outline-none text-xs sm:text-sm text-[#141413] placeholder:text-slate-400 px-2 pt-1 max-h-24 min-h-[36px]"
          />

          <div className="flex items-center justify-between pt-1 px-1 border-t border-slate-100 mt-1">
            <div className="flex items-center space-x-1 text-slate-400">
              <button
                type="button"
                className="p-1 hover:text-[#2a7b9b] hover:bg-[#dcf0fa] rounded-md transition"
                title="Adjuntar contexto (Simulado)"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                Shift + Enter para salto
              </span>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className={`inline-flex items-center justify-center p-1.5 rounded-xl transition-all ${
                inputText.trim() && !isGenerating
                  ? 'bg-[#2a7b9b] text-white hover:bg-[#1f5f78] shadow-xs cursor-pointer'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
