import { LocalModel, AttachedFile } from '../types';

export const DEFAULT_LOCAL_MODELS: LocalModel[] = [
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 (70B)',
    tag: 'Ollama / vLLM',
    description: 'Meta Llama 3.3 Instruct cuantizado local',
    size: '39 GB',
  },
  {
    id: 'deepseek-r1-14b',
    name: 'DeepSeek R1 (14B)',
    tag: 'Razonamiento',
    description: 'Modelo de pensamiento y razonamiento lógico local',
    size: '9.0 GB',
  },
  {
    id: 'qwen-2.5-coder-32b',
    name: 'Qwen 2.5 Coder (32B)',
    tag: 'Código y Datos',
    description: 'Especializado en Python, SQL, Excel y desarrollo',
    size: '19 GB',
  },
  {
    id: 'mistral-nemo-12b',
    name: 'Mistral Nemo (12B)',
    tag: 'Rápido',
    description: 'Multilingüe de alta velocidad para tareas generales',
    size: '7.1 GB',
  },
  {
    id: 'phi-4-14b',
    name: 'Phi-4 (14B)',
    tag: 'Microsoft',
    description: 'Alta precisión matemática y analítica',
    size: '9.1 GB',
  },
];

export function getFileCategory(file: File): AttachedFile['category'] {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const type = file.type.toLowerCase();

  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image';
  }
  if (type.includes('pdf') || ext === 'pdf') {
    return 'pdf';
  }
  if (
    type.includes('sheet') || 
    type.includes('excel') || 
    type.includes('csv') || 
    ['xlsx', 'xls', 'csv', 'tsv', 'parquet'].includes(ext)
  ) {
    return 'spreadsheet';
  }
  if (
    type.includes('word') || 
    type.includes('document') || 
    ['doc', 'docx', 'txt', 'rtf', 'odt', 'md'].includes(ext)
  ) {
    return 'document';
  }
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
