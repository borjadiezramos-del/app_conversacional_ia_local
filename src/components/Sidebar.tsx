import React from 'react';
import { 
  Plus, 
  Pin, 
  Clock, 
  FolderKanban, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Settings
} from 'lucide-react';
import { BDRLogo } from './BDRLogo';
import { Conversation, ProjectItem, MainNavigationTab } from '../types';
import { ConversationActionMenu } from './ConversationActionMenu';

interface SidebarProps {
  currentProject: string | null; // null means no project selected (conversaciones generales/sin proyecto)
  onSelectProject: (proj: string | null) => void;
  onNewChat: () => void;
  onSelectSavedChat: (chat: Conversation) => void;
  activeChatId?: string;
  conversations: Conversation[];
  projectsList: ProjectItem[];
  onTogglePin: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  activeTab: MainNavigationTab;
  onChangeTab: (tab: MainNavigationTab) => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentProject,
  onSelectProject,
  onNewChat,
  onSelectSavedChat,
  activeChatId,
  conversations,
  projectsList,
  onTogglePin,
  onRenameConversation,
  onDeleteConversation,
  isOpen,
  onToggleSidebar,
  activeTab,
  onChangeTab,
  onOpenSettings,
}) => {
  // Filtrar las conversaciones según el proyecto actualmente seleccionado
  // Si currentProject es null o 'general', mostramos las conversaciones que no pertenecen a ningún proyecto (o que tienen projectId = null / 'General')
  const filteredConversations = conversations.filter((c) => {
    if (!currentProject) {
      return !c.projectId || c.projectId === 'General';
    }
    return c.projectId === currentProject;
  });

  const pinnedChats = filteredConversations.filter((c) => c.pinned);
  const recentChats = filteredConversations.filter((c) => !c.pinned);

  if (!isOpen) {
    return (
      <aside 
        id="bdr-sidebar-collapsed"
        className="w-14 bg-white border-r border-[#e2e8f0] flex flex-col items-center py-4 justify-between transition-all duration-200 z-20 shrink-0"
      >
        <div className="flex flex-col items-center gap-4">
          <button 
            id="btn-expand-sidebar"
            onClick={onToggleSidebar}
            title="Expandir barra lateral"
            className="p-2 rounded-lg text-[#5e6d75] hover:text-[#2a7b9b] hover:bg-[#dcf0fa] transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            id="btn-quick-new-chat"
            onClick={() => {
              onChangeTab('chat');
              onNewChat();
            }}
            title="Nuevo Chat"
            className="w-9 h-9 rounded-xl bg-[#2a7b9b] text-white flex items-center justify-center hover:bg-[#1f5f78] shadow-sm transition"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            id="btn-quick-chat-tab"
            onClick={() => onChangeTab('chat')}
            title="Chat Principal"
            className={`p-2 rounded-lg transition ${
              activeTab === 'chat'
                ? 'bg-[#dcf0fa] text-[#2a7b9b]'
                : 'text-[#5e6d75] hover:bg-[#f1f5f9]'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            id="btn-quick-projects-tab"
            onClick={() => onChangeTab('projects')}
            title="Proyectos"
            className={`p-2 rounded-lg transition ${
              activeTab === 'projects'
                ? 'bg-[#dcf0fa] text-[#2a7b9b]'
                : 'text-[#5e6d75] hover:bg-[#f1f5f9]'
            }`}
          >
            <FolderKanban className="w-5 h-5" />
          </button>
        </div>

        {/* Botón inferior de configuración en modo colapsado */}
        {onOpenSettings && (
          <div className="flex flex-col items-center pb-2">
            <button
              id="btn-quick-settings"
              onClick={onOpenSettings}
              title="Configuración del Sistema BDR"
              className="p-2 rounded-lg text-[#5e6d75] hover:text-[#2a7b9b] hover:bg-[#dcf0fa] transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside 
      id="bdr-sidebar"
      className="w-72 bg-white border-r border-[#e2e8f0] flex flex-col justify-between transition-all duration-200 z-20 shrink-0 select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)]"
    >
      {/* Zona Superior y de Conversaciones */}
      <div className="flex flex-col p-3.5 overflow-y-auto flex-1">
        {/* Encabezado con Identidad y botón de navegación */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <BDRLogo size="sm" variant="mark" />
          </div>
          <button
            id="btn-collapse-sidebar"
            onClick={onToggleSidebar}
            title="Ocultar barra lateral"
            className="p-1.5 rounded-lg text-[#5e6d75] hover:text-[#2a7b9b] hover:bg-[#dcf0fa] transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Botón Principal: Nuevo Chat */}
        <button
          id="btn-new-chat"
          onClick={() => {
            onChangeTab('chat');
            onNewChat();
          }}
          className="w-full py-2.5 px-3.5 rounded-xl bg-[#2a7b9b] hover:bg-[#1f5f78] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(42,123,155,0.22)] transition-colors active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo chat</span>
        </button>

        {/* Navegación Superior: Chat y Proyectos */}
        <div className="mt-4 space-y-1">
          <button
            id="nav-tab-chat"
            onClick={() => onChangeTab('chat')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
              activeTab === 'chat'
                ? 'bg-[#dcf0fa] text-[#2a7b9b]'
                : 'text-[#334155] hover:bg-[#f1f5f9]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#2a7b9b]" />
            <span>Chat</span>
          </button>

          <button
            id="nav-tab-projects"
            onClick={() => onChangeTab('projects')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
              activeTab === 'projects'
                ? 'bg-[#dcf0fa] text-[#2a7b9b]'
                : 'text-[#334155] hover:bg-[#f1f5f9]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4 text-[#2a7b9b]" />
              <span>Proyectos</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/5 font-mono text-[#5e6d75]">
              {projectsList.length}
            </span>
          </button>
        </div>

        {/* Selector Desplegable de Proyectos Activo con opción de 'Sin proyecto (General)' */}
        <div className="mt-4 pt-3 border-t border-[#f1f5f9]">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[11px] font-bold text-[#5e6d75] tracking-wider uppercase flex items-center gap-1.5">
              <FolderKanban className="w-3 h-3 text-[#2a7b9b]" />
              Proyecto Activo
            </span>
            {currentProject && (
              <button
                onClick={() => onSelectProject(null)}
                className="text-[10px] text-[#2a7b9b] hover:underline font-medium"
              >
                Desmarcar
              </button>
            )}
          </div>
          <div className="relative">
            <select
              id="select-active-project"
              value={currentProject || ''}
              onChange={(e) => {
                const val = e.target.value;
                onSelectProject(val === '' ? null : val);
              }}
              className="w-full appearance-none bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#141413] text-xs font-semibold py-2 px-3 pr-8 rounded-lg border border-[#e2e8f0] focus:outline-none focus:border-[#2a7b9b] transition cursor-pointer"
            >
              <option value="">✨ Sin proyecto</option>
              {projectsList.map((proj) => (
                <option key={proj.id} value={proj.name}>
                  📁 {proj.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#5e6d75] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Sección: Chats Fijados */}
        {pinnedChats.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center gap-1.5 px-1 mb-1.5 text-[11px] font-bold text-[#5e6d75] uppercase tracking-wider">
              <Pin className="w-3 h-3 text-[#2a7b9b]" />
              Fijados ({pinnedChats.length})
            </div>
            <div className="space-y-0.5">
              {pinnedChats.map((chat) => {
                const isActive = activeTab === 'chat' && activeChatId === chat.id;
                return (
                  <div
                    key={chat.id}
                    id={`chat-pinned-row-${chat.id}`}
                    onClick={() => {
                      onChangeTab('chat');
                      onSelectSavedChat(chat);
                    }}
                    className={`w-full group px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                      isActive
                        ? 'bg-[#dcf0fa] text-[#2a7b9b] font-semibold'
                        : 'text-[#334155] hover:bg-[#f1f5f9] hover:text-[#141413]'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-1 flex-1">
                      <span className="truncate">{chat.title}</span>
                      <span className="text-[10px] text-[#94a3b8] group-hover:text-[#5e6d75]">
                        {chat.date}
                      </span>
                    </div>

                    {/* Menú de opciones (3 puntos verticales) */}
                    <ConversationActionMenu
                      conversationId={chat.id}
                      title={chat.title}
                      isPinned={chat.pinned}
                      onTogglePin={onTogglePin}
                      onRename={onRenameConversation}
                      onDelete={onDeleteConversation}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sección: Chats y Tareas Recientes */}
        <div className="mt-5">
          <div className="flex items-center gap-1.5 px-1 mb-1.5 text-[11px] font-bold text-[#5e6d75] uppercase tracking-wider">
            <Clock className="w-3 h-3 text-[#2a7b9b]" />
            {currentProject ? `Chats de ${currentProject}` : 'Chats'} ({recentChats.length})
          </div>
          {recentChats.length === 0 ? (
            <p className="text-[11px] text-[#94a3b8] px-2 py-1 italic">
              {currentProject
                ? `No hay chats en este proyecto`
                : `No hay chats`}
            </p>
          ) : (
            <div className="space-y-0.5">
              {recentChats.map((chat) => {
                const isActive = activeTab === 'chat' && activeChatId === chat.id;
                return (
                  <div
                    key={chat.id}
                    id={`chat-recent-row-${chat.id}`}
                    onClick={() => {
                      onChangeTab('chat');
                      onSelectSavedChat(chat);
                    }}
                    className={`w-full group px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                      isActive
                        ? 'bg-[#dcf0fa] text-[#2a7b9b] font-semibold'
                        : 'text-[#334155] hover:bg-[#f1f5f9] hover:text-[#141413]'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-1 flex-1">
                      <span className="truncate">{chat.title}</span>
                      <span className="text-[10px] text-[#94a3b8] group-hover:text-[#5e6d75]">
                        {chat.date}
                      </span>
                    </div>

                    {/* Menú de opciones (3 puntos verticales) */}
                    <ConversationActionMenu
                      conversationId={chat.id}
                      title={chat.title}
                      isPinned={chat.pinned}
                      onTogglePin={onTogglePin}
                      onRename={onRenameConversation}
                      onDelete={onDeleteConversation}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Pie del Sidebar: Configuración del Sistema BDR y Estado */}
      <div className="p-3 border-t border-[#e2e8f0] bg-white">
        <button
          id="btn-sidebar-open-settings"
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-[#475569] hover:text-[#1e293b] hover:bg-[#f8fafc] transition border border-transparent hover:border-[#e2e8f0] group"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#5e6d75] group-hover:text-[#2a7b9b] transition" />
            <span className="font-semibold">Configuración BDR</span>
          </div>
          <span className="text-[10px] font-mono text-[#8c9ba5] bg-[#f1f5f9] px-1.5 py-0.5 rounded">
            v2.4
          </span>
        </button>
      </div>
    </aside>
  );
};
