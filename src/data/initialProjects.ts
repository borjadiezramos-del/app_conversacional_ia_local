import { ProjectItem } from '../types';

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-operaciones',
    name: 'Operaciones BDR',
    description: 'Optimización de procesos, seguimiento de SLA, logística y automatización de flujos de trabajo.',
    systemPrompt: 'Actúa como consultor de operaciones senior. Prioriza la reducción de tiempos de ciclo, métricas SLA y diagramas de flujo claros.',
    color: '#0284c7',
    updatedAt: 'Ayer',
    knowledgeFiles: [
      {
        id: 'kf-2',
        name: 'Protocolo_SLA_Operaciones.docx',
        size: 198000,
        type: 'document',
        category: 'document',
        addedAt: 'Hace 4 días',
        summary: 'Tiempos de respuesta estándar (sub-4h) y escalados para incidencias operativas.',
      },
      {
        id: 'kf-3',
        name: 'Kpi_Operaciones_2026.xlsx',
        size: 512000,
        type: 'spreadsheet',
        category: 'spreadsheet',
        addedAt: 'Hace 1 semana',
        summary: 'Registro histórico de cumplimiento y eficiencia por departamento.',
      },
    ],
  },
  {
    id: 'proj-finanzas',
    name: 'Finanzas & Reporting',
    description: 'Modelado presupuestario, auditoría de costes, proyecciones de flujo de caja y balances Q1-Q4.',
    systemPrompt: 'Especialista en análisis financiero y reporting ejecutivo. Expresa valores en euros (€) con desglose riguroso y comparativas interanuales.',
    color: '#059669',
    updatedAt: 'Hace 3 días',
    knowledgeFiles: [
      {
        id: 'kf-4',
        name: 'Modelo_Financiero_Q3_Q4.xlsx',
        size: 890000,
        type: 'spreadsheet',
        category: 'spreadsheet',
        addedAt: 'Hace 5 días',
        summary: 'Plan de tesorería, previsiones de ingresos y partidas de inversión tecnológica.',
      },
    ],
  },
  {
    id: 'proj-producto',
    name: 'Desarrollo de Producto',
    description: 'Arquitectura de software, especificaciones técnicas de APIs y despliegue de modelos de inferencia local.',
    systemPrompt: 'Ingeniero de producto y arquitectura de IA. Orienta las respuestas a modelos locales seguros, bajo consumo de memoria y TypeScript limpio.',
    color: '#7c3aed',
    updatedAt: 'Hace 5 días',
    knowledgeFiles: [
      {
        id: 'kf-5',
        name: 'Arquitectura_Modelos_Locales.md',
        size: 2450,
        type: 'md',
        category: 'code',
        addedAt: 'Hace 1 semana',
        summary: 'Detalle de inferencia Ollama/vLLM, quantización 4-bit/8-bit y seguridad en sandbox.',
        content: `# Arquitectura de Inferencia Local BDR

## 1. Visión General
Este proyecto implementa la orquestación de modelos de lenguaje grandes (LLMs) ejecutados estrictamente en hardware local, garantizando privacidad absoluta de datos y cumplimiento normativo europeo.

## 2. Pila Tecnológica
- **Motor de Inferencia:** Ollama / vLLM con soporte para aceleración CUDA.
- **Modelos Evaluados:**
  - \`deepseek-r1-14b\` (Razonamiento y lógica estructurada)
  - \`llama-3.3-70b\` (Comprensión semántica y redacción)
  - \`qwen-2.5-coder-32b\` (Generación de código y análisis tabular)
- **Quantización:** AWQ / GGUF (4-bit y 8-bit) para optimización de VRAM.

## 3. Directrices de Integración
1. Todas las llamadas se realizan a través de endpoints locales seguros.
2. Los archivos de conocimiento adjuntos se inyectan en el prompt de contexto.
3. No se envían telemetrías ni datos a proveedores en la nube.
`,
      },
    ],
  },
];
