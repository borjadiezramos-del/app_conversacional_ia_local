export type FileSource = 'local' | 'drive' | 'onedrive' | 'url';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string; // mime or extension
  previewUrl?: string; // for images
  category: 'pdf' | 'spreadsheet' | 'document' | 'image' | 'other';
  source?: FileSource;
  sourceUrl?: string;
}

export interface LocalModel {
  id: string;
  name: string;
  tag: string;
  description?: string;
  size?: string;
  isCustom?: boolean;
}

export type ChatMode = 
  | 'standard' 
  | 'canvas' 
  | 'deep_research' 
  | 'code' 
  | 'guided_learning'
  | 'image_gen'
  | 'video_gen'
  | 'music_gen';

export interface CanvasSlide {
  id: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  notes?: string;
  accentColor?: string;
}

export interface CanvasDocument {
  id: string;
  title: string;
  type: 'markdown' | 'code' | 'table' | 'text' | 'html' | 'presentation';
  content: string;
  slides?: CanvasSlide[];
  language?: string;
  version: number;
  updatedAt: string;
  history?: { version: number; content: string; updatedAt: string }[];
}

export interface DeepResearchStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed';
  detail?: string;
  findingsCount?: number;
}

export interface DeepResearchReport {
  id: string;
  topic: string;
  query: string;
  stage: 'planning' | 'executing' | 'completed';
  progressPercent: number;
  steps: DeepResearchStep[];
  executiveSummary: string;
  keyInsights: { title: string; description: string; tag?: string }[];
  sources: { title: string; domain: string; snippet?: string; reliability: 'Alta' | 'Media' | 'Verificada' }[];
  methodology: string;
  completedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedAnswer?: number;
}

export interface FlashcardItem {
  id: string;
  term: string;
  definition: string;
  category?: string;
  mnemonic?: string;
}

export interface GuidedLearningSession {
  id: string;
  topic: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  objective: string;
  conceptSummary: string;
  socraticQuestions: string[];
  keyPoints: string[];
  corporateContext: string;
  quiz?: QuizQuestion;
  flashcards?: FlashcardItem[];
  nextStepPrompt: string;
}

export interface GeneratedImageItem {
  id: string;
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  style?: string;
  imageUrl: string;
  status: 'generating' | 'ready' | 'error';
  progressPercent?: number;
  stageLabel?: string;
  createdAt: string;
}

export interface GeneratedVideoItem {
  id: string;
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  videoUrl: string;
  thumbnailUrl?: string;
  status: 'queued' | 'processing' | 'rendering' | 'ready' | 'error';
  progressPercent: number;
  stageLabel?: string;
  durationSeconds: number;
  createdAt: string;
}

export interface GeneratedMusicItem {
  id: string;
  prompt: string;
  title: string;
  genre: string;
  tempo: string;
  mood: string;
  audioDataUrl?: string;
  waveform: number[];
  durationSeconds: number;
  status: 'generating' | 'ready' | 'error';
  createdAt: string;
}

export interface WebSearchResult {
  id?: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  publishedDate?: string;
}

export interface WebSearchMeta {
  query: string;
  results: WebSearchResult[];
  scrapedUrl?: string;
  executedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelName?: string;
  attachments?: AttachedFile[];
  artifactId?: string;
  mode?: ChatMode;
  canvasDoc?: CanvasDocument;
  deepResearch?: DeepResearchReport;
  guidedLearning?: GuidedLearningSession;
  imageGen?: GeneratedImageItem;
  videoGen?: GeneratedVideoItem;
  musicGen?: GeneratedMusicItem;
  webSearch?: WebSearchMeta;
}

export interface Conversation {
  id: string;
  title: string;
  date: string;
  pinned: boolean;
  messages: Message[];
  projectId?: string;
}

export interface ProjectKnowledgeFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'document' | 'pdf' | 'spreadsheet' | 'code' | 'image' | 'other';
  addedAt: string;
  summary?: string;
  source?: FileSource;
  sourceUrl?: string;
  content?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  systemPrompt?: string; // Custom instructions / knowledge context for this project
  knowledgeFiles: ProjectKnowledgeFile[];
  color?: string;
  updatedAt: string;
}

export type MainNavigationTab = 'chat' | 'projects';

export interface Artifact {
  id: string;
  title: string;
  type: 'html' | 'svg' | 'react';
  code: string;
  version: number;
  description: string;
  createdAt: string;
}

export type ViewMode = 'preview' | 'code';

export interface StreamlitFile {
  name: string;
  path: string;
  language: string;
  content: string;
  description: string;
}
