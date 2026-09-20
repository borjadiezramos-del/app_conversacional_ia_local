import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pin, PinOff, Pencil, Trash2, Check, X } from 'lucide-react';

interface ConversationActionMenuProps {
  conversationId: string;
  title: string;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export const ConversationActionMenu: React.FC<ConversationActionMenuProps> = ({
  conversationId,
  title,
  isPinned,
  onTogglePin,
  onRename,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsConfirmingDelete(false);
        if (!isRenaming) {
          setEditedTitle(title);
        }
      }
    };
    if (isOpen || isRenaming) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, isRenaming, title]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editedTitle.trim()) {
      onRename(conversationId, editedTitle.trim());
    } else {
      setEditedTitle(title);
    }
    setIsRenaming(false);
    setIsOpen(false);
  };

  const handleCancelRename = () => {
    setEditedTitle(title);
    setIsRenaming(false);
    setIsOpen(false);
  };

  return (
    <div 
      className="relative shrink-0 flex items-center" 
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botón de 3 puntos verticales (igual a la imagen adjunta) */}
      <button
        type="button"
        id={`btn-menu-conversation-${conversationId}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setIsConfirmingDelete(false);
        }}
        title="Opciones de conversación: Fijar, renombrar o eliminar"
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#e2e8f0] text-[#141413]'
            : 'text-[#8c9ba5] hover:text-[#141413] hover:bg-[#e2e8f0]/80'
        }`}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Menú desplegable flotante con las opciones: Fijar, Cambiar nombre, Eliminar */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-[#e2e8f0] shadow-xl z-50 py-1 animate-fadeIn text-xs text-[#141413]">
          {!isRenaming && !isConfirmingDelete && (
            <>
              {/* Opción: Fijar / Desfijar */}
              <button
                type="button"
                id={`btn-pin-conversation-${conversationId}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(conversationId);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#f1f5f9] transition"
              >
                {isPinned ? (
                  <>
                    <PinOff className="w-3.5 h-3.5 text-[#5e6d75]" />
                    <span>Desfijar de favoritos</span>
                  </>
                ) : (
                  <>
                    <Pin className="w-3.5 h-3.5 text-[#2a7b9b]" />
                    <span>Fijar conversación</span>
                  </>
                )}
              </button>

              {/* Opción: Cambiar el nombre */}
              <button
                type="button"
                id={`btn-rename-conversation-${conversationId}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#f1f5f9] transition"
              >
                <Pencil className="w-3.5 h-3.5 text-[#5e6d75]" />
                <span>Cambiar el nombre</span>
              </button>

              <div className="h-px bg-[#f1f5f9] my-1" />

              {/* Opción: Eliminar */}
              <button
                type="button"
                id={`btn-delete-conversation-${conversationId}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmingDelete(true);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </>
          )}

          {/* Formulario para cambiar el nombre */}
          {isRenaming && (
            <form onSubmit={handleSaveRename} className="p-2 space-y-2">
              <div className="text-[11px] font-semibold text-[#5e6d75]">Nuevo nombre:</div>
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleCancelRename();
                }}
                className="w-full px-2 py-1 text-xs border border-[#2a7b9b] rounded-md focus:outline-none"
              />
              <div className="flex items-center justify-end gap-1 pt-1">
                <button
                  type="button"
                  onClick={handleCancelRename}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="submit"
                  className="p-1 text-white bg-[#2a7b9b] hover:bg-[#1f5f78] rounded"
                  title="Guardar"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Confirmación para eliminar */}
          {isConfirmingDelete && (
            <div className="p-2.5 space-y-2">
              <p className="text-[11px] font-medium text-red-600">
                ¿Eliminar esta conversación?
              </p>
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmingDelete(false);
                  }}
                  className="px-2 py-1 text-[11px] text-[#5e6d75] hover:bg-[#f1f5f9] rounded"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conversationId);
                    setIsOpen(false);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 rounded shadow-xs"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
