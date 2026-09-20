import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CenteredChatArea } from './components/CenteredChatArea';
import { ProjectsView } from './components/ProjectsView';
import { SettingsModal } from './components/SettingsModal';
import { CanvasWorkspacePanel } from './components/CanvasWorkspacePanel';
import { 
  Message, 
  LocalModel, 
  AttachedFile, 
  Conversation, 
  ProjectItem, 
  ProjectKnowledgeFile,
  MainNavigationTab,
  ChatMode,
  CanvasDocument,
  DeepResearchReport,
  GuidedLearningSession,
  GeneratedImageItem,
  GeneratedVideoItem,
  GeneratedMusicItem,
  WebSearchResult,
  WebSearchMeta
} from './types';
import { 
  searchWeb, 
  scrapeUrl, 
  extractUrlsFromText, 
  buildGroundedPrompt, 
  queryLocalOllama,
  ScrapedPageResult
} from './services/webSearchService';
import { DEFAULT_LOCAL_MODELS } from './data/localModels';
import { INITIAL_PROJECTS } from './data/initialProjects';

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    title: 'Análisis de ventas Q3',
    date: 'Hoy',
    pinned: true,
    // Sin proyecto (Conversación general)
    messages: [
      {
        id: 'c1-msg-1',
        role: 'user',
        content: '¿Cuál ha sido el balance de ventas en Q3?',
        timestamp: '10:14',
      },
      {
        id: 'c1-msg-2',
        role: 'assistant',
        modelName: 'DeepSeek R1 (BDR Fine-Tuned)',
        content: 'El balance de Q3 refleja un incremento del 14.2% frente a la meta trimestral, alcanzando un volumen neto de € 1.284.950 impulsado por servicios corporativos.',
        timestamp: '10:15',
      },
    ],
  },
  {
    id: 'c2',
    title: 'Resumen ejecutivo BDR',
    date: 'Ayer',
    pinned: true,
    projectId: 'Operaciones BDR',
    messages: [
      {
        id: 'c2-msg-1',
        role: 'user',
        content: 'Generar resumen ejecutivo de operaciones',
        timestamp: '16:30',
      },
      {
        id: 'c2-msg-2',
        role: 'assistant',
        modelName: 'Qwen 2.5 72B Instruct',
        content: 'Resumen operativo consolidado: Eficiencia operativa del 94.8%, tiempos de ciclo de 1.2 días hábiles y cumplimiento SLA del 99.1%.',
        timestamp: '16:31',
      },
    ],
  },
  {
    id: 'c3',
    title: 'Revisión técnica de API',
    date: 'Hace 3 días',
    pinned: false,
    projectId: 'Desarrollo de Producto',
    messages: [
      {
        id: 'c3-msg-1',
        role: 'user',
        content: 'Revisar endpoints de inferencia local con baja latencia',
        timestamp: '11:05',
      },
      {
        id: 'c3-msg-2',
        role: 'assistant',
        modelName: 'Llama 3.3 70B (BDR Local)',
        content: 'Los endpoints locales procesan un promedio de 84 tokens/segundo sin transmisión de datos al exterior, manteniendo latencia sub-50ms.',
        timestamp: '11:06',
      },
    ],
  },
  {
    id: 'c4',
    title: 'Estrategia de marca BDR',
    date: 'Hace 5 días',
    pinned: false,
    // Sin proyecto (Conversación general)
    messages: [
      {
        id: 'c4-msg-1',
        role: 'user',
        content: 'Definir pilares para la identidad corporativa BDR',
        timestamp: '09:20',
      },
      {
        id: 'c4-msg-2',
        role: 'assistant',
        modelName: 'Mistral Large 2 (BDR Optimized)',
        content: 'Pilares clave: 1. Privacidad de datos absoluta en local, 2. Precisión analítica institucional, 3. Integración fluida con flujos corporativos.',
        timestamp: '09:21',
      },
    ],
  },
];

const LOCAL_STORAGE_PROJECTS_KEY = 'bdr_projects_data_v2';
const LOCAL_STORAGE_CONVERSATIONS_KEY = 'bdr_conversations_data_v2';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback a iniciales
    }
    return INITIAL_CONVERSATIONS;
  });

  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  // currentProject puede ser el nombre del proyecto o null (General / Sin proyecto)
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<MainNavigationTab>('chat');

  // Modos de chat especializados: Standard, Canva, Deep Research, Code, Aprendizaje guiado
  const [chatMode, setChatMode] = useState<ChatMode>('standard');
  const [isCanvasOpen, setIsCanvasOpen] = useState<boolean>(false);
  const [activeCanvasDoc, setActiveCanvasDoc] = useState<CanvasDocument | null>(null);

  // Proyectos con persistencia en localStorage
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback a iniciales
    }
    return INITIAL_PROJECTS;
  });

  // Guardar en localStorage ante cualquier cambio en proyectos
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projectsList));
    } catch (e) {
      console.error('Error guardando proyectos en localStorage', e);
    }
  }, [projectsList]);

  // Guardar conversaciones en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Error guardando conversaciones en localStorage', e);
    }
  }, [conversations]);

  // Modelos locales configurables
  const [localModels, setLocalModels] = useState<LocalModel[]>(DEFAULT_LOCAL_MODELS);
  const [selectedModel, setSelectedModel] = useState<LocalModel>(DEFAULT_LOCAL_MODELS[0]);

  const activeConversation = conversations.find((c) => c.id === activeChatId);

  const handleAddModel = (newModel: LocalModel) => {
    setLocalModels((prev) => [...prev, newModel]);
  };

  const handleRemoveModel = (id: string) => {
    setLocalModels((prev) => prev.filter((m) => m.id !== id));
    if (selectedModel.id === id) {
      setSelectedModel(DEFAULT_LOCAL_MODELS[0]);
    }
  };

  // Gestión de Proyectos
  const handleCreateProject = (projectData: Omit<ProjectItem, 'id' | 'updatedAt' | 'knowledgeFiles'> & { knowledgeFiles?: ProjectKnowledgeFile[] }) => {
    const newId = `proj-${Date.now()}`;
    const newProj: ProjectItem = {
      ...projectData,
      id: newId,
      updatedAt: 'Hoy',
      knowledgeFiles: projectData.knowledgeFiles || [],
    };
    setProjectsList((prev) => [newProj, ...prev]);
    setCurrentProject(newProj.name);
  };

  const handleUpdateProject = (id: string, updates: Partial<ProjectItem>) => {
    const existingProject = projectsList.find((p) => p.id === id);
    const oldName = existingProject?.name;

    setProjectsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: 'Hoy' } : p))
    );

    // Si se actualizó el nombre del proyecto, sincronizar currentProject y conversaciones asociadas
    if (updates.name && oldName && updates.name !== oldName) {
      if (currentProject === oldName) {
        setCurrentProject(updates.name);
      }
      setConversations((prev) =>
        prev.map((c) => (c.projectId === oldName ? { ...c, projectId: updates.name } : c))
      );
    }
  };

  const handleDeleteProject = (id: string) => {
    const projectToDelete = projectsList.find((p) => p.id === id);
    setProjectsList((prev) => prev.filter((p) => p.id !== id));
    if (projectToDelete && currentProject === projectToDelete.name) {
      setCurrentProject(null);
    }
    // Desvincular conversaciones del proyecto eliminado para que no queden huérfanas
    if (projectToDelete) {
      setConversations((prev) =>
        prev.map((c) =>
          c.projectId === projectToDelete.name || c.projectId === id
            ? { ...c, projectId: undefined }
            : c
        )
      );
    }
  };

  const handleAddKnowledgeFile = (projectId: string, file: ProjectKnowledgeFile) => {
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, knowledgeFiles: [...p.knowledgeFiles, file], updatedAt: 'Hoy' }
          : p
      )
    );
  };

  const handleAddKnowledgeFiles = (projectId: string, files: ProjectKnowledgeFile[]) => {
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, knowledgeFiles: [...p.knowledgeFiles, ...files], updatedAt: 'Hoy' }
          : p
      )
    );
  };

  const handleUpdateKnowledgeFile = (projectId: string, fileId: string, updates: Partial<ProjectKnowledgeFile>) => {
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              knowledgeFiles: p.knowledgeFiles.map((f) =>
                f.id === fileId ? { ...f, ...updates } : f
              ),
              updatedAt: 'Hoy',
            }
          : p
      )
    );
  };

  const handleRemoveKnowledgeFile = (projectId: string, fileId: string) => {
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              knowledgeFiles: p.knowledgeFiles.filter((f) => f.id !== fileId),
              updatedAt: 'Hoy',
            }
          : p
      )
    );
  };

  // Abrir chat vinculado a un proyecto concreto
  const handleOpenProjectChat = (project: ProjectItem) => {
    setCurrentProject(project.name);
    handleNewChat();
    setActiveTab('chat');
  };

  // Acción de Nuevo Chat (vuelve al estado inicial de inicio)
  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId(undefined);
    setActiveTab('chat');
  };

  // Reanudar un chat fijado o reciente
  const handleSelectSavedChat = (chat: Conversation) => {
    setActiveChatId(chat.id);
    setMessages(chat.messages || []);
    // Si el chat pertenece a un proyecto, sincronizamos el proyecto activo (o null si es general)
    if (chat.projectId && chat.projectId !== 'General') {
      setCurrentProject(chat.projectId);
    } else {
      setCurrentProject(null);
    }
  };

  // Fijar / Desfijar conversación
  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  // Cambiar el nombre de la conversación
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Eliminar conversación
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      handleNewChat();
    }
  };

  const handleOpenCanvasDoc = (doc: CanvasDocument) => {
    setActiveCanvasDoc(doc);
    setIsCanvasOpen(true);
  };

  const handleUpdateCanvasDoc = (updated: CanvasDocument) => {
    setActiveCanvasDoc(updated);
    setMessages((prev) =>
      prev.map((m) => (m.canvasDoc?.id === updated.id ? { ...m, canvasDoc: updated } : m))
    );
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.canvasDoc?.id === updated.id ? { ...m, canvasDoc: updated } : m
              ),
            }
          : c
      )
    );
  };

  // Envío de mensaje en el chat central con soporte de modos: Canva, Deep Research, Code, Aprendizaje guiado, General y Búsqueda Web en Vivo
  const handleSendMessage = async (
    text: string, 
    attachments?: AttachedFile[], 
    mode: ChatMode = chatMode,
    useWebSearch: boolean = false
  ) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `msg-${Date.now()}`;

    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: timeNow,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      mode: mode,
    };

    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsGenerating(true);

    // Si es un nuevo chat sin id asignado, creamos automáticamente la conversación vinculada al proyecto activo (o sin proyecto)
    let currentId = activeChatId;
    if (!currentId) {
      const generatedId = `c-${Date.now()}`;
      currentId = generatedId;
      setActiveChatId(generatedId);
      const newConv: Conversation = {
        id: generatedId,
        title: text.length > 28 ? `${text.slice(0, 28)}...` : text || 'Nueva consulta',
        date: 'Hoy',
        pinned: false,
        projectId: currentProject || undefined,
        messages: updatedMessages,
      };
      setConversations((prev) => [newConv, ...prev]);
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === currentId ? { ...c, messages: updatedMessages } : c))
      );
    }

    // 1.5. Ejecución de Búsqueda Web en Tiempo Real si está habilitada o si hay URLs en el texto
    const urlsInText = extractUrlsFromText(text);
    const shouldSearchWeb = useWebSearch || urlsInText.length > 0;

    let webResults: WebSearchResult[] = [];
    let scrapedResult: ScrapedPageResult | null = null;
    let generatedWebSearchMeta: WebSearchMeta | undefined = undefined;

    if (shouldSearchWeb && text.trim()) {
      try {
        if (urlsInText.length > 0) {
          scrapedResult = await scrapeUrl(urlsInText[0]);
        }
        webResults = await searchWeb(text);
        if (webResults.length > 0 || scrapedResult) {
          generatedWebSearchMeta = {
            query: text,
            results: webResults,
            scrapedUrl: scrapedResult?.url,
            executedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
      } catch (err) {
        console.error('Error durante la búsqueda web:', err);
      }
    }

    // 2. Respuesta generada inteligente según el modo activo
    setTimeout(async () => {
      const respTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const clean = text.toLowerCase().trim();
      let assistantReply = '';
      let generatedCanvasDoc: CanvasDocument | undefined = undefined;
      let generatedDeepResearch: DeepResearchReport | undefined = undefined;
      let generatedGuidedLearning: GuidedLearningSession | undefined = undefined;
      let generatedImageItem: GeneratedImageItem | undefined = undefined;
      let generatedVideoItem: GeneratedVideoItem | undefined = undefined;
      let generatedMusicItem: GeneratedMusicItem | undefined = undefined;

      const filesNote = attachments && attachments.length > 0 
        ? `\n\n📁 **Documentos analizados (${attachments.length}):**\n` + 
          attachments.map(a => `• \`${a.name}\` (${a.type}, ${(a.size / 1024).toFixed(1)} KB)`).join('\n')
        : '';

      const projectContextLabel = currentProject 
        ? `el proyecto **${currentProject}**` 
        : `asistencia corporativa BDR`;

      // -------------------------------------------------------------
      // MODO 1: CANVA (Documentos interactivos editables en tiempo real)
      // -------------------------------------------------------------
      if (mode === 'canvas') {
        const docTitle = text.length > 30 ? `${text.slice(0, 30)}...` : text || 'Documento Estratégico BDR';
        const docId = `canvas-doc-${Date.now()}`;
        
        const docBody = `# ${docTitle.toUpperCase()}
*Elaborado para: ${projectContextLabel} • Versión 1.0 • Entorno local privado*

## 1. Resumen Ejecutivo
El presente documento formaliza los requerimientos, directrices y entregables clave relativos a: **${text}**. Se prioriza la confidencialidad, la trazabilidad técnica y la máxima eficiencia en la ejecución de los hitos corporativos.

## 2. Objetivos y Alcance
- **Objetivo Estratégico:** Optimizar el rendimiento y gobernanza en ${projectContextLabel}.
- **Población / Áreas de impacto:** Equipos de operaciones, tecnología y control de calidad.
- **Tiempos de implementación:** Ciclos iterativos de 2 a 4 semanas.

## 3. Matriz de Entregables y Responsables
| Fase | Hito Principal | Estado | Responsable |
| :--- | :--- | :---: | :--- |
| **Fase 1** | Auditoría y levantamiento de requisitos | ✅ Completado | BDR Lead |
| **Fase 2** | Implementación y validación en local | 🔄 En curso | Equipo Técnico |
| **Fase 3** | Formación y despliegue operativo | ⏳ Planificado | Operaciones |

## 4. Notas Técnicas y Seguridad
> **Gobernanza de Datos:** Todo el procesamiento se realiza mediante modelos locales en infraestructura propia, garantizando que ninguna información sensible o confidencial salga a la red pública.

## 5. Próximos Pasos Inmediatos
1. Revisar los puntos del presente documento directamente en este panel lateral.
2. Añadir modificaciones en tiempo real desde el editor.
3. Descargar el informe en formato Markdown (.md) o texto listo para firma.`;

        generatedCanvasDoc = {
          id: docId,
          title: docTitle,
          type: 'markdown',
          content: docBody,
          version: 1,
          updatedAt: 'Ahora',
          history: [],
        };

        assistantReply = `He creado el documento interactivo en **Canva** para ${projectContextLabel}.${filesNote}\n\nSe ha abierto el **panel lateral derecho**, donde puedes modificar el texto, tablas y encabezados **en tiempo real**. También puedes descargarlo, copiarlo o pedirme refinamientos rápidos.`;
        
        setActiveCanvasDoc(generatedCanvasDoc);
        setIsCanvasOpen(true);

      // -------------------------------------------------------------
      // MODO 2: DEEP RESEARCH (Investigaciones profundas multi-etapa)
      // -------------------------------------------------------------
      } else if (mode === 'deep_research') {
        const researchTopic = text || 'Análisis estratégico profundo';
        generatedDeepResearch = {
          id: `research-${Date.now()}`,
          topic: researchTopic,
          query: text,
          stage: 'completed',
          progressPercent: 100,
          completedAt: 'Hoy • 100% verificado',
          methodology: 'Investigación analítica multi-fuente asistida por LLMs locales y verificación de consistencia.',
          steps: [
            {
              id: 'st-1',
              title: '1. Formulación de hipótesis y definición de variables clave',
              status: 'completed',
              detail: `Delimitación del alcance analítico sobre "${researchTopic}" y criterios de exclusión.`,
              findingsCount: 4,
            },
            {
              id: 'st-2',
              title: '2. Rastreo exhaustivo en bases de conocimiento y fuentes técnicas',
              status: 'completed',
              detail: 'Búsqueda en repositorios corporativos BDR, estándares de la industria y literatura especializada.',
              findingsCount: 9,
            },
            {
              id: 'st-3',
              title: '3. Cotejo cruzado, triangulación y contraste de consistencia',
              status: 'completed',
              detail: 'Filtrado de sesgos, verificación de métricas de rendimiento y validación de datos empíricos.',
              findingsCount: 6,
            },
            {
              id: 'st-4',
              title: '4. Síntesis analítica y redacción de conclusiones ejecutivas',
              status: 'completed',
              detail: 'Estructuración de recomendaciones operativas y matriz de impacto vs. esfuerzo.',
              findingsCount: 5,
            },
          ],
          executiveSummary: `La investigación profunda sobre "${researchTopic}" concluye que la implementación basada en modelos locales optimizados para BDR ofrece una reducción de latencia del 38% y un ahorro de costes operativos superior al 45% frente a dependencias en la nube pública, con garantía estricta de soberanía de datos y cumplimiento regulatorio.`,
          keyInsights: [
            {
              title: 'Soberanía y Resiliencia de Datos',
              description: 'El procesamiento 100% on-premise anula riesgos de exfiltración y cumple con los estándares más rigurosos de auditoría institucional.',
              tag: 'Seguridad',
            },
            {
              title: 'Eficiencia Computacional',
              description: 'Los modelos cuantizados a 4 y 8 bits (Q4_K_M / Q8_0) retienen el 98.6% de la precisión del modelo base con una fracción del consumo de VRAM.',
              tag: 'Rendimiento',
            },
            {
              title: 'Integración en Procesos Core',
              description: 'La estandarización de APIs compatibles con Ollama agiliza la adopción sin requerir reescrituras de la lógica de negocio previa.',
              tag: 'Arquitectura',
            },
            {
              title: 'Curva de Retorno de Inversión (ROI)',
              description: 'El punto de equilibrio financiero se alcanza en el cuarto mes de operación continuada bajo cargas medianas y altas.',
              tag: 'Finanzas',
            },
          ],
          sources: webResults.length > 0
            ? webResults.map(r => ({
                title: r.title,
                domain: r.domain,
                snippet: r.snippet,
                reliability: 'Verificada' as const
              }))
            : [
                {
                  title: 'Manual de Arquitectura y Seguridad en IA Local (BDR Internal Standards)',
                  domain: 'bdr.internal/docs/security-ai',
                  snippet: 'Enfoque zero-trust para inferencia local con Ollama y aceleración por GPU privada.',
                  reliability: 'Verificada',
                },
                {
                  title: 'Estudio Comparativo de Rendimiento en Inferencia Local (Gartner / IEEE)',
                  domain: 'ieee.org/publications/local-inference-2025',
                  snippet: 'Métricas de throughput en arquitecturas ARM y x86 para modelos densos y MoE.',
                  reliability: 'Alta',
                },
                {
                  title: 'Marco Regulatorio Europeo de Inteligencia Artificial (EU AI Act Compliance)',
                  domain: 'europa.eu/ai-act/compliance-guidelines',
                  snippet: 'Exención de riesgos de transferencia transfronteriza al operar en entornos locales aislados.',
                  reliability: 'Verificada',
                },
              ],
        };

        assistantReply = `He completado una **investigación profunda (Deep Research)** sobre: *"${text}"* para ${projectContextLabel}.${filesNote}\n\nSe han analizado las variables críticas, contrastado fuentes y estructurado el informe ejecutivo con hallazgos e hipótesis validadas que puedes examinar a continuación:`;

      // -------------------------------------------------------------
      // MODO 3: CODE (Programación como Claude / Artifacts)
      // -------------------------------------------------------------
      } else if (mode === 'code') {
        const isPython = clean.includes('python') || clean.includes('py') || clean.includes('pandas') || clean.includes('numpy');
        const isHtml = clean.includes('html') || clean.includes('dashboard') || clean.includes('interactiv') || clean.includes('calculadora');
        
        let codeLang = isPython ? 'python' : isHtml ? 'html' : 'typescript';
        let codeContent = '';
        let codeTitle = 'Script de Solución Técnica';

        if (isPython) {
          codeTitle = 'procesamiento_datos_bdr.py';
          codeContent = `"""
Módulo de Procesamiento y Automatización de Datos BDR
Optimizado para ejecución con modelos locales y pipeline seguro.
"""

import sys
import json
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

@dataclass
class TransactionRecord:
    id: str
    client: str
    amount: float
    category: str
    status: str

class BDRDataEngine:
    def __init__(self, project_name: str = "BDR Core"):
        self.project_name = project_name
        self.records: List[TransactionRecord] = []

    def load_dataset(self, data: List[Dict[str, Any]]) -> int:
        """Carga y valida los registros de transacciones."""
        for item in data:
            record = TransactionRecord(
                id=item.get("id", f"TX-{len(self.records)+1}"),
                client=item.get("client", "Cliente Anónimo"),
                amount=float(item.get("amount", 0.0)),
                category=item.get("category", "General"),
                status=item.get("status", "Pendiente")
            )
            self.records.append(record)
        return len(self.records)

    def calculate_kpis(self) -> Dict[str, Any]:
        """Calcula métricas clave de desempeño."""
        if not self.records:
            return {"error": "Sin datos disponibles"}
            
        total_volume = sum(r.amount for r in self.records)
        completed = [r for r in self.records if r.status == "Completado"]
        
        return {
            "project": self.project_name,
            "total_records": len(self.records),
            "total_volume_eur": round(total_volume, 2),
            "completion_rate": f"{(len(completed)/len(self.records))*100:.1f}%",
            "average_ticket": round(total_volume / len(self.records), 2)
        }

# Punto de entrada de prueba
if __name__ == "__main__":
    sample_data = [
        {"client": "Marshal Services", "amount": 45200.50, "category": "Consultoría", "status": "Completado"},
        {"client": "BDR Analytics", "amount": 89400.00, "category": "Software", "status": "Completado"},
        {"client": "Global Logistics", "amount": 12500.00, "category": "Operaciones", "status": "En curso"},
    ]
    
    engine = BDRDataEngine(project_name="Auditoría Operativa BDR")
    count = engine.load_dataset(sample_data)
    kpis = engine.calculate_kpis()
    
    print(f"=== RESULTADOS BDR DATA ENGINE ({count} registros) ===")
    print(json.dumps(kpis, indent=2, ensure_ascii=False))
`;
        } else if (isHtml) {
          codeTitle = 'widget_kpis_interactivo.html';
          codeContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dashboard Interactivo BDR</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }
    h2 { margin-top: 0; color: #2a7b9b; font-size: 20px; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
    .metric-box {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 12px;
      border-left: 4px solid #2a7b9b;
    }
    .metric-val { font-size: 24px; font-weight: bold; color: #0f172a; }
    .metric-lbl { font-size: 12px; color: #64748b; margin-top: 4px; }
    button {
      background: #2a7b9b;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
    }
    button:hover { background: #1f5f78; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Simulador de Impacto BDR</h2>
    <p style="font-size: 13px; color: #64748b;">Ajusta y recalcula los KPIs operativos en tiempo real.</p>
    
    <div class="metric-grid">
      <div class="metric-box">
        <div class="metric-val" id="val-roi">+38.5%</div>
        <div class="metric-lbl">Ahorro en Procesos</div>
      </div>
      <div class="metric-box">
        <div class="metric-val" id="val-time">1.2 días</div>
        <div class="metric-lbl">Tiempo Medio de Ciclo</div>
      </div>
    </div>
    
    <button onclick="recalcular()">Simular Nueva Carga de Trabajo</button>
  </div>

  <script>
    function recalcular() {
      const nuevoRoi = (35 + Math.random() * 15).toFixed(1);
      const nuevoTiempo = (0.8 + Math.random() * 0.7).toFixed(1);
      document.getElementById('val-roi').innerText = '+' + nuevoRoi + '%';
      document.getElementById('val-time').innerText = nuevoTiempo + ' días';
    }
  </script>
</body>
</html>`;
        } else {
          codeTitle = 'bdr_service.ts';
          codeContent = `/**
 * Servicio de Inferencia y Gestión Local BDR
 * Compatible con la API REST de Ollama en localhost:11434
 */

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
  };
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
}

export class BDRLocalAIService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  /**
   * Envía una petición de completado a Ollama local
   */
  async generateCompletion(payload: OllamaRequest): Promise<string> {
    try {
      const res = await fetch(\`\${this.baseUrl}/api/generate\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(\`Error de conexión con Ollama: HTTP \${res.status}\`);
      }

      const data: OllamaResponse = await res.json();
      return data.response;
    } catch (error) {
      console.error('Fallo al conectar con el runtime local:', error);
      throw error;
    }
  }
}
`;
        }

        generatedCanvasDoc = {
          id: `code-doc-${Date.now()}`,
          title: codeTitle,
          type: isHtml ? 'html' : 'code',
          language: codeLang,
          content: codeContent,
          version: 1,
          updatedAt: 'Ahora',
          history: [],
        };

        assistantReply = `He generado el código para **${text}** con enfoque modular y tipado estricto.${filesNote}\n\nHe abierto el **editor interactivo de código** en el panel lateral derecho (al estilo Claude Artifacts), donde puedes **editar el código en tiempo real**, previsualizar la ejecución o descargar el script directamente.`;
        
        setActiveCanvasDoc(generatedCanvasDoc);
        setIsCanvasOpen(true);

      // -------------------------------------------------------------
      // MODO 4: APRENDIZAJE GUIADO (Formación socrática y educación)
      // -------------------------------------------------------------
      } else if (mode === 'guided_learning') {
        const topic = text || 'Conceptos Clave de Inteligencia Artificial';
        generatedGuidedLearning = {
          id: `learning-${Date.now()}`,
          topic: topic,
          level: 'Intermedio',
          objective: `Comprender los fundamentos, arquitectura y aplicación práctica de "${topic}" en la operativa diaria de BDR.`,
          conceptSummary: `Para dominar "${topic}", es esencial entender que no se trata de una fórmula aislada, sino de un proceso sistemático donde la calidad de los datos de entrada determina el 80% de la precisión del resultado final.`,
          socraticQuestions: [
            `¿Qué implicaciones tendría en la fiabilidad de ${topic} si el conjunto de datos de entrenamiento contiene sesgos no auditados?`,
            '¿Por qué una inferencia local con memoria de contexto amplia previene la pérdida de coherencia en procesos largos?',
            '¿De qué manera cuantificarías el retorno de inversión al automatizar esta tarea frente a la revisión manual?'
          ],
          keyPoints: [
            'Diferenciación clara entre procesamiento determinista (código tradicional) y probabilístico (LLMs).',
            'Importancia del contexto corporativo para evitar alucinaciones en modelos de lenguaje.',
            'Gestión de temperatura: valores bajos (0.1 - 0.3) para análisis analítico riguroso y valores medios (0.7) para creatividad.',
            'Principio de Privacidad por Diseño: retención de datos en local como ventaja competitiva.',
          ],
          corporateContext: `En proyectos de BDR, aplicar este concepto permite automatizar la extracción de balances y la auditoría de documentos legales reduciendo el tiempo de revisión manual de horas a escasos segundos, sin exponer información privilegiada a terceros.`,
          quiz: {
            id: `quiz-${Date.now()}`,
            question: 'En un entorno corporativo confidencial de BDR, ¿cuál es la principal ventaja de utilizar inferencia local con Ollama frente a una API comercial pública?',
            options: [
              'No requiere energía eléctrica para ejecutarse.',
              'Los datos confidenciales nunca salen de la infraestructura interna de la empresa, garantizando soberanía total.',
              'Permite utilizar cualquier modelo sin necesidad de tener memoria RAM o GPU.',
              'Elimina la necesidad de escribir prompts claros.',
            ],
            correctIndex: 1,
            explanation: '¡Exacto! Al ejecutar la inferencia on-premise con Ollama, los documentos, contratos y registros permanecen estrictamente dentro de la red privada de BDR, cumpliendo con los estándares más exigentes de privacidad y cumplimiento normativo.',
          },
          nextStepPrompt: `Profundizar en el siguiente nivel formativo sobre "${topic}" con casos avanzados y optimización de prompts`,
        };

        assistantReply = `¡Excelente iniciativa formativa! He preparado la lección interactiva de **Aprendizaje Guiado** sobre *"${text}"* para ${projectContextLabel}.${filesNote}\n\nRevisa el desglose conceptual a continuación y pon a prueba tus conocimientos con la **pregunta interactiva de autoevaluación**:`;

      // -------------------------------------------------------------
      // MODO 5: CREAR IMAGEN (Image Generation)
      // -------------------------------------------------------------
      } else if (mode === 'image_gen' || clean.startsWith('crear imagen') || clean.startsWith('generar imagen')) {
        const imgPrompt = text.replace(/^(crear|generar)\s+imagen\s*:?\s*/i, '').trim() || text || 'Visualización de datos corporativos BDR en alta resolución';
        
        // Generar un SVG estético procedural con gradientes empresariales
        const svgContent = encodeURIComponent(`
          <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0f172a"/>
                <stop offset="60%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#020617"/>
              </linearGradient>
              <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2a7b9b"/>
                <stop offset="100%" stop-color="#38bdf8"/>
              </linearGradient>
              <radialGradient id="glow" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stop-color="#2a7b9b" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="1024" height="1024" fill="url(#bgGrad)"/>
            <circle cx="512" cy="450" r="400" fill="url(#glow)"/>
            <circle cx="512" cy="480" r="300" fill="none" stroke="url(#primaryGrad)" stroke-width="4" opacity="0.6"/>
            <circle cx="512" cy="480" r="200" fill="none" stroke="#2a7b9b" stroke-width="2" stroke-dasharray="14 14" opacity="0.8"/>
            <circle cx="512" cy="480" r="90" fill="url(#primaryGrad)" opacity="0.25"/>
            <polygon points="512,340 630,550 394,550" fill="none" stroke="#38bdf8" stroke-width="6"/>
            <circle cx="512" cy="480" r="16" fill="#38bdf8"/>
            <text x="512" y="770" fill="#f8fafc" font-size="30" font-family="system-ui, -apple-system, sans-serif" font-weight="700" letter-spacing="2" text-anchor="middle">BDR SYNTHETIC VISUAL</text>
            <text x="512" y="815" fill="#94a3b8" font-size="19" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">${imgPrompt.slice(0, 48)}</text>
          </svg>
        `);

        generatedImageItem = {
          id: `img-${Date.now()}`,
          prompt: imgPrompt,
          aspectRatio: '1:1',
          style: 'Fotografía cinemática corporativa',
          imageUrl: `data:image/svg+xml;utf8,${svgContent}`,
          status: 'ready',
          createdAt: 'Hoy • Generado por IA',
        };

        assistantReply = `He generado la imagen mediante IA para **${imgPrompt}** en ${projectContextLabel}.${filesNote}\n\nPuedes previsualizar la composición, inspeccionar en pantalla completa, elegir diferente aspect ratio o descargar la imagen en alta definición.`;

      // -------------------------------------------------------------
      // MODO 6: CREAR VÍDEO (Video Generation)
      // -------------------------------------------------------------
      } else if (mode === 'video_gen' || clean.startsWith('crear video') || clean.startsWith('crear vídeo') || clean.startsWith('generar video') || clean.startsWith('generar vídeo')) {
        const vidPrompt = text.replace(/^(crear|generar)\s+v[ií]deo\s*:?\s*/i, '').trim() || text || 'Secuencia cinemática 3D corporativa';

        generatedVideoItem = {
          id: `vid-${Date.now()}`,
          prompt: vidPrompt,
          status: 'ready',
          durationSeconds: 8,
          progressPercent: 100,
          videoUrl: 'local-video-pipeline',
          createdAt: 'Hoy • Renderizado nativo',
        };

        assistantReply = `He renderizado el vídeo solicitado para: *"${vidPrompt}"* en ${projectContextLabel}.${filesNote}\n\nEl clip cuenta con un reproductor nativo embebido con controles de reproducción interactivos (play/pausa, rebobinado, barra de progreso y pantalla completa).`;

      // -------------------------------------------------------------
      // MODO 7: CREAR MÚSICA (Audio/Music Synthesis)
      // -------------------------------------------------------------
      } else if (mode === 'music_gen' || clean.startsWith('crear música') || clean.startsWith('crear musica') || clean.startsWith('generar audio') || clean.startsWith('generar música')) {
        const musPrompt = text.replace(/^(crear|generar)\s+(m[uú]sica|audio|pista)\s*:?\s*/i, '').trim() || text || 'Banda sonora corporativa ambiental';
        
        let genre = 'Ambient Lo-Fi';
        let tempo = '95 BPM';
        if (clean.includes('rock') || clean.includes('guitar')) {
          genre = 'Rock & Groove';
          tempo = '128 BPM';
        } else if (clean.includes('electro') || clean.includes('techno') || clean.includes('synth')) {
          genre = 'Synthwave & Electronic';
          tempo = '120 BPM';
        } else if (clean.includes('clasic') || clean.includes('piano') || clean.includes('orquest')) {
          genre = 'Neoclásica Cinemática';
          tempo = '80 BPM';
        }

        generatedMusicItem = {
          id: `mus-${Date.now()}`,
          title: `Pista BDR - ${genre}`,
          prompt: musPrompt,
          genre: genre,
          tempo: tempo,
          mood: 'Productividad y foco operativo',
          waveform: Array.from({ length: 48 }, () => Math.floor(Math.random() * 75 + 20)),
          durationSeconds: 16,
          status: 'ready',
          createdAt: 'Hoy • Sintetizador Web Audio',
        };

        assistantReply = `He sintetizado la pista de audio interactiva para: *"${musPrompt}"* en ${projectContextLabel}.${filesNote}\n\nSe ha renderizado la forma de onda interactiva (waveform) con espectro dinámico. Puedes reproducir, pausar, explorar el timeline y descargar el archivo WAV masterizado.`;

      // -------------------------------------------------------------
      // MODO 8: ESTÁNDAR / GENERAL (Consulta habitual directa)
      // -------------------------------------------------------------
      } else {
        if (generatedWebSearchMeta && (webResults.length > 0 || scrapedResult)) {
          // Si el usuario tiene Ollama ejecutándose localmente en su Mac M1, intentamos inferencia con prompt enriquecido (RAG)
          const groundedPrompt = buildGroundedPrompt(text, webResults, scrapedResult);
          let localOllamaReply: string | null = null;
          try {
            localOllamaReply = await queryLocalOllama(selectedModel.id, groundedPrompt);
          } catch (e) {
            console.log('Ollama local no disponible en este momento:', e);
          }

          if (localOllamaReply && localOllamaReply.trim()) {
            assistantReply = localOllamaReply;
          } else {
            // Síntesis grounded de alta fidelidad con fuentes web citadas
            const topSources = webResults.slice(0, 5);
            const sourceBullets = topSources
              .map((r, i) => `**[${i + 1}] [${r.title}](${r.url})** • *${r.domain}*\n> "${r.snippet}"`)
              .join('\n\n');

            let scrapedContext = '';
            if (scrapedResult) {
              scrapedContext = `\n\n📄 **Lectura directa del contenido web:** *${scrapedResult.title}*\n${scrapedResult.text.slice(0, 450)}...`;
            }

            assistantReply = `He consultado internet en tiempo real para resolver: **"${text}"**.\n\n### 🌐 Hallazgos y fuentes verificadas en vivo:\n${sourceBullets}${scrapedContext}\n\n---\n📌 **Inferencia y Privacidad en Mac M1:**\nLa consulta ha recopilado las fuentes anteriores y las ha preparado para su procesamiento. Cuando ejecutes en tu terminal \`ollama run ${selectedModel.id}\`, el modelo local resolverá estas consultas RAG directamente en tu memoria unificada sin consumir swap.`;
          }
        } else if (clean.includes('métricas') || clean.includes('dashboard') || clean.includes('ejecutiv')) {
          assistantReply = `Aquí tienes el desglose de métricas ejecutivas en ${projectContextLabel}:${filesNote}\n\n• **Ingresos YTD:** € 1.284.950 (+14.2% respecto a objetivo)\n• **Clientes Activos:** 3.420 (Retención neta: 96.4%)\n• **Eficiencia Operativa:** 94.8% (Tiempo de ciclo: 1.2 días)\n\nProcesado localmente con **${selectedModel.name}**.`;
        } else if (clean.includes('propuesta') || clean.includes('plantilla')) {
          assistantReply = `He preparado la estructura corporativa para ${projectContextLabel}:${filesNote}\n\n1. **Resumen Ejecutivo**: Alcance y metas estratégicas.\n2. **Propuesta Técnica**: Arquitectura de modelos locales y seguridad de datos.\n3. **Cronograma y Entregables**: Hitos mensuales.\n4. **Condiciones Operativas**.\n\n¿Deseas profundizar en algún punto?`;
        } else if (attachments && attachments.length > 0) {
          assistantReply = `He recibido y analizado los archivos adjuntos:${filesNote}\n\n${text ? `Respecto a tu consulta *"${text}"*:` : 'Resumen del contenido analizado:'}\n\nHe extraído las tablas, campos y datos relevantes de los documentos para ${projectContextLabel}. ¿Qué análisis o transformación específica necesitas que ejecute?`;
        } else {
          assistantReply = `Entendido. He procesado tu consulta: *"${text}"* en ${projectContextLabel}.\n\n¿Deseas activar el modo **Canva** para redactar un documento en el panel lateral, **Deep Research** para una investigación exhaustiva, **Code** para programar o **Aprendizaje guiado** para formación?`;
        }
      }

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        modelName: selectedModel.name,
        content: assistantReply,
        timestamp: respTime,
        mode: mode,
        webSearch: generatedWebSearchMeta,
        canvasDoc: generatedCanvasDoc,
        deepResearch: generatedDeepResearch,
        guidedLearning: generatedGuidedLearning,
        imageGen: generatedImageItem,
        videoGen: generatedVideoItem,
        musicGen: generatedMusicItem,
      };

      setMessages((prev) => {
        const fullMessages = [...prev, assistantMsg];
        setConversations((allConvs) =>
          allConvs.map((c) => (c.id === currentId ? { ...c, messages: fullMessages } : c))
        );
        return fullMessages;
      });

      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="flex h-screen w-screen bg-[#f5f5f5] text-[#141413] overflow-hidden font-sans">
      {/* 1. Barra Lateral Nativa (Sidebar con navegación a Chat y Proyectos) */}
      <Sidebar
        currentProject={currentProject}
        onSelectProject={(proj) => setCurrentProject(proj)}
        onNewChat={handleNewChat}
        onSelectSavedChat={handleSelectSavedChat}
        activeChatId={activeChatId}
        conversations={conversations}
        projectsList={projectsList}
        onTogglePin={handleTogglePin}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* 2. Área Principal: Alterna entre Chat Central (con Canvas lateral) y la Vista de Proyectos */}
      <main className="flex-1 flex h-full overflow-hidden relative">
        {activeTab === 'projects' ? (
          <ProjectsView
            projects={projectsList}
            conversations={conversations}
            onSelectProject={(proj) => setCurrentProject(proj.name)}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onOpenProjectChat={handleOpenProjectChat}
            onAddKnowledgeFile={handleAddKnowledgeFile}
            onAddKnowledgeFiles={handleAddKnowledgeFiles}
            onUpdateKnowledgeFile={handleUpdateKnowledgeFile}
            onRemoveKnowledgeFile={handleRemoveKnowledgeFile}
          />
        ) : (
          <div className="flex-1 flex h-full w-full overflow-hidden relative">
            <CenteredChatArea
              messages={messages}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              currentProject={currentProject}
              models={localModels}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              onAddModel={handleAddModel}
              onRemoveModel={handleRemoveModel}
              activeConversation={activeConversation}
              onTogglePin={handleTogglePin}
              onRenameConversation={handleRenameConversation}
              onDeleteConversation={handleDeleteConversation}
              chatMode={chatMode}
              onChangeChatMode={setChatMode}
              onOpenCanvasDoc={handleOpenCanvasDoc}
              isCanvasOpen={isCanvasOpen}
              onToggleCanvas={() => setIsCanvasOpen(!isCanvasOpen)}
              activeCanvasDoc={activeCanvasDoc}
            />

            {/* Panel Lateral Interactivo de Canva / Code Workspace (Editable en tiempo real) */}
            {isCanvasOpen && activeCanvasDoc && (
              <CanvasWorkspacePanel
                document={activeCanvasDoc}
                isOpen={isCanvasOpen}
                onClose={() => setIsCanvasOpen(false)}
                onUpdateDocument={handleUpdateCanvasDoc}
                onSendChatFollowup={(followupText) => handleSendMessage(followupText, [], chatMode)}
              />
            )}
          </div>
        )}
      </main>

      {/* 3. Modal de Configuración del Sistema BDR */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
