import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileCode,
  Eye,
  Edit3,
  Columns,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Table as TableIcon,
  Quote,
  Save,
  Sparkles,
  Download
} from 'lucide-react';
import { ProjectKnowledgeFile } from '../types';

interface MarkdownEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fileData: { name: string; content: string; fileId?: string }) => void;
  initialFile?: ProjectKnowledgeFile | null;
}

const TEMPLATES = [
  {
    id: 'blank',
    title: 'En blanco',
    desc: 'Documento vacío',
    content: `# Nuevo Documento\n\nEscribe aquí la información de referencia para el proyecto...\n`,
  },
  {
    id: 'directrices',
    title: 'Directrices del Proyecto',
    desc: 'Reglas y objetivos',
    content: `# Directrices y Contexto del Proyecto\n\n## 1. Misión y Objetivos\n- Definir el propósito estratégico de este proyecto en BDR.\n- Establecer los entregables prioritarios y criterios de éxito.\n\n## 2. Reglas para los Modelos de IA\n- Mantener un tono profesional, analítico y preciso.\n- Respetar la confidencialidad de la información interna.\n- Formatear datos tabulares con columnas y cifras en euros (€).\n\n## 3. Glosario y Términos Clave\n| Término | Definición |\n| :--- | :--- |\n| **SLA** | Service Level Agreement (Tiempo de respuesta acordado) |\n| **Inferencia Local** | Ejecución de modelos en hardware propio sin salida a internet |\n`,
  },
  {
    id: 'arquitectura',
    title: 'Especificación Técnica',
    desc: 'APIs y arquitectura',
    content: `# Especificación Técnica de Arquitectura\n\n## Arquitectura de Inferencia Local\nEste proyecto procesa consultas mediante modelos cuantizados ejecutados en local.\n\n### Modelos Soportados\n- **DeepSeek R1 (14B / 32B)**: Razonamiento lógico y análisis causal.\n- **Llama 3.3 (70B)**: Procesamiento de lenguaje natural y síntesis.\n- **Qwen 2.5 Coder (32B)**: Análisis de datos, Python y SQL.\n\n### Formato de API\n\`\`\`json\n{\n  "model": "deepseek-r1-14b",\n  "temperature": 0.2,\n  "stream": false,\n  "messages": [\n    {"role": "user", "content": "Analizar métricas de rendimiento"}\n  ]\n}\n\`\`\`\n\n## Consideraciones de Seguridad\n- [x] No almacenar claves en texto plano\n- [x] Validación de formatos de archivo admitidos\n- [ ] Auditoría periódica de permisos de acceso\n`,
  },
  {
    id: 'reunion',
    title: 'Acta de Reunión / Notas',
    desc: 'Hitos y acuerdos',
    content: `# Acta de Reunión de Seguimiento\n\n**Fecha:** ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}\n**Participantes:** Equipo BDR\n\n## Puntos Tratados\n1. Revisión de avances en las tareas clave.\n2. Identificación de bloqueos y dependencias.\n3. Acuerdos y asignación de responsables.\n\n## Acuerdos y Próximos Pasos\n- [ ] Actualizar documentación técnica antes del viernes\n- [ ] Validar los nuevos archivos de conocimiento\n- [ ] Notificar al comité sobre el progreso\n`,
  },
];

export const MarkdownEditorModal: React.FC<MarkdownEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFile,
}) => {
  const [fileName, setFileName] = useState('nuevo-documento.md');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialFile) {
        setFileName(initialFile.name.endsWith('.md') ? initialFile.name : `${initialFile.name}.md`);
        setContent(initialFile.content || `# ${initialFile.name}\n\n${initialFile.summary || 'Documento de conocimiento.'}`);
      } else {
        setFileName('directrices-proyecto.md');
        setContent(TEMPLATES[1].content);
      }
    }
  }, [isOpen, initialFile]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmplContent: string) => {
    if (content.trim().length > 20) {
      if (window.confirm('¿Deseas reemplazar el contenido actual con esta plantilla?')) {
        setContent(tmplContent);
      }
    } else {
      setContent(tmplContent);
    }
  };

  const insertFormatting = (prefix: string, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;

    const newText = 
      content.substring(0, start) + 
      prefix + selectedText + suffix + 
      content.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanName = fileName.trim() || 'documento.md';
    if (!cleanName.endsWith('.md')) {
      cleanName += '.md';
    }

    onSave({
      name: cleanName,
      content,
      fileId: initialFile?.id,
    });
    onClose();
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const byteSize = new Blob([content]).size;
  const sizeFormatted = byteSize < 1024 ? `${byteSize} B` : `${(byteSize / 1024).toFixed(1)} KB`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xl w-full max-w-5xl h-[92vh] max-h-[820px] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header superior */}
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#dcf0fa] text-[#2a7b9b] flex items-center justify-center font-bold">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#141413]">
                {initialFile ? 'Editar documento Markdown (.md)' : 'Crear nuevo archivo Markdown (.md)'}
              </h2>
              <p className="text-[11px] text-[#5e6d75]">
                Archivos de conocimiento directo para el contexto permanente de los modelos locales de BDR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              title="Descargar archivo .md a tu ordenador"
              className="px-2.5 py-1.5 rounded-lg border border-[#cbd5e1] text-xs font-medium text-[#475569] hover:bg-white hover:text-[#2a7b9b] transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar .md</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8c9ba5] hover:text-[#141413] hover:bg-[#e2e8f0] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Nombre de Archivo y Plantillas */}
        <div className="px-5 py-3 border-b border-[#f1f5f9] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <label className="text-xs font-semibold text-[#475569] shrink-0">
              Nombre de archivo:
            </label>
            <div className="relative flex-1">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="ejemplo-documento.md"
                className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2a7b9b] text-[#141413]"
              />
            </div>
          </div>

          {/* Plantillas rápidas */}
          {!initialFile && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-[#8c9ba5] font-medium shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2a7b9b]" />
                Plantillas:
              </span>
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl.content)}
                  className="px-2 py-1 rounded-md bg-[#f1f5f9] hover:bg-[#dcf0fa] text-[#475569] hover:text-[#2a7b9b] font-medium transition shrink-0"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Barra de herramientas Markdown y Modos de visualización */}
        <div className="px-5 py-2 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          {/* Formateadores */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => insertFormatting('# ', '', 'Título')}
              title="Título H1"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('## ', '', 'Subtítulo')}
              title="Subtítulo H2"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ', '', 'Sección')}
              title="Sección H3"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-[#cbd5e1] mx-1" />

            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'texto en negrita')}
              title="Negrita (**texto**)"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'texto en cursiva')}
              title="Cursiva (*texto*)"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <Italic className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-[#cbd5e1] mx-1" />

            <button
              type="button"
              onClick={() => insertFormatting('- ', '', 'Elemento')}
              title="Lista con viñetas"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('1. ', '', 'Elemento ordenado')}
              title="Lista numerada"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- [ ] ', '', 'Tarea pendiente')}
              title="Lista de tareas"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <CheckSquare className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-[#cbd5e1] mx-1" />

            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'codigo')}
              title="Código en línea"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n| Columna 1 | Columna 2 | Columna 3 |\n| :--- | :--- | :--- |\n| Dato 1 | Dato 2 | Dato 3 |\n', '')}
              title="Insertar tabla"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> ', '', 'Nota importante')}
              title="Cita / Bloque destacado"
              className="p-1.5 rounded hover:bg-[#e2e8f0] text-[#475569] hover:text-[#141413]"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle de vistas: Dividido / Solo editor / Solo vista previa */}
          <div className="flex items-center bg-[#e2e8f0] p-0.5 rounded-lg shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                viewMode === 'edit'
                  ? 'bg-white text-[#141413] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#141413]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                viewMode === 'split'
                  ? 'bg-white text-[#141413] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#141413]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dividido</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                viewMode === 'preview'
                  ? 'bg-white text-[#141413] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#141413]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vista previa</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del Editor y Previsualización */}
        <div className="flex-1 flex overflow-hidden">
          {/* Panel Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`flex-1 flex flex-col h-full overflow-hidden ${viewMode === 'split' ? 'border-r border-[#e2e8f0]' : ''}`}>
              <div className="px-4 py-1.5 bg-[#f1f5f9]/60 border-b border-[#e2e8f0] text-[10px] font-semibold text-[#64748b] flex items-center justify-between">
                <span>EDITOR MARKDOWN (Sintaxis soportada: títulos, listas, tablas, código)</span>
                <span>UTF-8</span>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Escribe aquí tu documento en formato Markdown..."
                className="flex-1 w-full p-4 font-mono text-xs sm:text-sm text-[#1e293b] leading-relaxed resize-none focus:outline-none bg-white selection:bg-[#dcf0fa]"
                spellCheck={false}
              />
            </div>
          )}

          {/* Panel Vista Previa Renderizada */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafafa]">
              <div className="px-4 py-1.5 bg-[#f1f5f9]/60 border-b border-[#e2e8f0] text-[10px] font-semibold text-[#64748b] flex items-center justify-between">
                <span>VISTA PREVIA DE RENDERIZADO</span>
                <span>Contexto de Conocimiento BDR</span>
              </div>
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto font-sans text-sm text-[#1e293b] leading-relaxed">
                <MarkdownRenderPreview markdown={content} />
              </div>
            </div>
          )}
        </div>

        {/* Barra inferior con métricas y botón guardar */}
        <div className="px-5 py-3 border-t border-[#e2e8f0] bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#64748b] flex items-center gap-3">
            <span>{wordCount} palabras</span>
            <span>•</span>
            <span>{charCount} caracteres</span>
            <span>•</span>
            <span className="font-semibold text-[#2a7b9b]">{sizeFormatted}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748b] hover:bg-[#f1f5f9] transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#2a7b9b] hover:bg-[#1f5f78] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{initialFile ? 'Guardar cambios' : 'Guardar en conocimiento'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para renderizar el Markdown de forma nítida y visual sin dependencias frágiles
export const MarkdownRenderPreview: React.FC<{ markdown: string }> = ({ markdown }) => {
  if (!markdown || !markdown.trim()) {
    return (
      <div className="text-center py-12 text-[#94a3b8] italic text-xs">
        No hay contenido redactado para previsualizar.
      </div>
    );
  }

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeLanguage = '';

  let inTable = false;
  let tableRows: string[][] = [];

  const flushCodeBlock = (key: number) => {
    if (codeBlockContent.length > 0) {
      elements.push(
        <div key={`code-${key}`} className="my-3 rounded-xl bg-[#0f172a] text-[#e2e8f0] p-3 font-mono text-xs overflow-x-auto shadow-inner">
          {codeLanguage && (
            <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-1.5 border-b border-white/10 pb-1">
              {codeLanguage}
            </div>
          )}
          <pre className="leading-relaxed">{codeBlockContent.join('\n')}</pre>
        </div>
      );
      codeBlockContent = [];
      codeLanguage = '';
    }
  };

  const flushTable = (key: number) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter(r => !r.every(c => c.replace(/[:\-]/g, '').trim() === ''));

      elements.push(
        <div key={`tbl-${key}`} className="my-3 overflow-x-auto border border-[#e2e8f0] rounded-xl bg-white shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8fafc] text-[#334155] border-b border-[#e2e8f0] font-semibold">
              <tr>
                {headerRow.map((cell, idx) => (
                  <th key={`th-${idx}`} className="px-3.5 py-2.5">
                    {parseInlineMarkdown(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {bodyRows.map((row, rIdx) => (
                <tr key={`tr-${rIdx}`} className="hover:bg-[#f8fafc]/60">
                  {row.map((cell, cIdx) => (
                    <td key={`td-${cIdx}`} className="px-3.5 py-2 text-[#475569]">
                      {parseInlineMarkdown(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Bloque de código
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCodeBlock(index);
      } else {
        if (inTable) {
          inTable = false;
          flushTable(index);
        }
        inCodeBlock = true;
        codeLanguage = trimmed.replace('```', '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Tablas
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      inTable = false;
      flushTable(index);
    }

    // Encabezados
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-xl sm:text-2xl font-bold text-[#0f172a] mt-5 mb-2 pb-1.5 border-b border-[#e2e8f0]">
          {parseInlineMarkdown(trimmed.replace('# ', ''))}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-base sm:text-lg font-bold text-[#1e293b] mt-4 mb-2">
          {parseInlineMarkdown(trimmed.replace('## ', ''))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-sm sm:text-base font-bold text-[#334155] mt-3 mb-1.5">
          {parseInlineMarkdown(trimmed.replace('### ', ''))}
        </h3>
      );
      return;
    }

    // Separador
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${index}`} className="my-4 border-[#e2e8f0]" />);
      return;
    }

    // Cita
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${index}`} className="my-2.5 pl-3.5 border-l-3 border-[#2a7b9b] text-xs sm:text-sm text-[#475569] italic bg-[#dcf0fa]/20 py-1.5 rounded-r-lg">
          {parseInlineMarkdown(trimmed.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Tareas
    if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
      const isChecked = trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ');
      const taskText = trimmed.replace(/- \[[ xX]\] /, '');
      elements.push(
        <div key={`task-${index}`} className="flex items-center gap-2 text-xs sm:text-sm text-[#334155] my-1 ml-1">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="w-3.5 h-3.5 rounded text-[#2a7b9b] border-[#cbd5e1] pointer-events-none"
          />
          <span className={isChecked ? 'line-through text-[#94a3b8]' : ''}>
            {parseInlineMarkdown(taskText)}
          </span>
        </div>
      );
      return;
    }

    // Listas con viñetas
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={`li-${index}`} className="ml-5 list-disc text-xs sm:text-sm text-[#334155] my-0.5 leading-relaxed">
          {parseInlineMarkdown(trimmed.replace(/^[-*]\s+/, ''))}
        </li>
      );
      return;
    }

    // Listas numeradas
    if (/^\d+\.\s+/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s+/, '');
      elements.push(
        <li key={`oli-${index}`} className="ml-5 list-decimal text-xs sm:text-sm text-[#334155] my-0.5 leading-relaxed">
          {parseInlineMarkdown(text)}
        </li>
      );
      return;
    }

    // Línea vacía
    if (!trimmed) {
      elements.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    // Párrafo normal
    elements.push(
      <p key={`p-${index}`} className="text-xs sm:text-sm text-[#334155] my-1 leading-relaxed">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });

  if (inCodeBlock) flushCodeBlock(lines.length);
  if (inTable) flushTable(lines.length);

  return <div className="space-y-0.5">{elements}</div>;
};

// Parser básico para negritas, cursivas y código en línea
function parseInlineMarkdown(text: string): React.ReactNode {
  // Manejo de código en línea `code`
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0] font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-[#0f172a]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-[#334155]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
