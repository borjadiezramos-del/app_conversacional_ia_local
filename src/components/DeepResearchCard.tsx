import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Search,
  Sparkles,
  BookOpen,
  Play,
  Plus,
  Trash2,
  Edit2,
  Download,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { DeepResearchReport, DeepResearchStep } from '../types';

interface DeepResearchCardProps {
  report: DeepResearchReport;
  onApprovePlan?: (updatedReport: DeepResearchReport) => void;
}

export const DeepResearchCard: React.FC<DeepResearchCardProps> = ({
  report,
  onApprovePlan,
}) => {
  const [stage, setStage] = useState<'planning' | 'executing' | 'completed'>(
    report.stage || (report.progressPercent === 100 ? 'completed' : 'planning')
  );
  const [steps, setSteps] = useState<DeepResearchStep[]>(report.steps || []);
  const [newStepText, setNewStepText] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [progress, setProgress] = useState(report.progressPercent || 0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const [showSources, setShowSources] = useState(true);

  // Ejecución en segundo plano cuando el usuario aprueba el plan
  useEffect(() => {
    if (stage === 'executing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 12;
          if (next >= 100) {
            clearInterval(interval);
            setStage('completed');
            return 100;
          }
          const stepIdx = Math.min(steps.length - 1, Math.floor((next / 100) * steps.length));
          setCurrentStepIndex(stepIdx);
          return next;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [stage, steps.length]);

  const handleApproveAndRun = () => {
    setStage('executing');
    setProgress(15);
    setCurrentStepIndex(0);
    if (onApprovePlan) {
      onApprovePlan({
        ...report,
        stage: 'executing',
        steps,
        progressPercent: 15,
      });
    }
  };

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    const newStep: DeepResearchStep = {
      id: `step-${Date.now()}`,
      title: newStepText.trim(),
      status: 'pending',
      detail: 'Paso añadido por el usuario para investigación prioritaria',
    };
    setSteps([...steps, newStep]);
    setNewStepText('');
    setIsAddingStep(false);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const handleDownloadReport = () => {
    const markdownContent = `# Reporte de Investigación: ${report.topic}
Fecha: ${report.completedAt || 'Hoy'}
Metodología: ${report.methodology}

## Resumen Ejecutivo
${report.executiveSummary}

## Hallazgos e Hipótesis
${report.keyInsights.map((k) => `### ${k.title}\n${k.description}\n`).join('\n')}

## Fuentes Consultadas
${report.sources.map((s) => `- [${s.title}] (${s.domain}) - Fiabilidad: ${s.reliability}`).join('\n')}
`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deep_research_${report.topic.toLowerCase().replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-3 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[#cbd5e1] rounded-2xl p-4 sm:p-5 shadow-xs text-xs space-y-4">
      {/* Cabecera del Agente Autónomo */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#141413] text-sm">Deep Research Agent</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                stage === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : stage === 'executing'
                  ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {stage === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                {stage === 'executing' && <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />}
                {stage === 'planning' && 'Plan de investigación listo'}
                {stage === 'executing' && 'Investigando en segundo plano...'}
                {stage === 'completed' && 'Informe exhaustivo entregado'}
              </span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Tema: <span className="font-medium text-[#1e293b]">{report.topic}</span>
            </p>
          </div>
        </div>

        <div className="text-[11px] text-[#64748b] bg-white px-2.5 py-1 rounded-lg border border-[#e2e8f0] font-mono">
          {report.completedAt || 'En curso'}
        </div>
      </div>

      {/* ETAPA 1: PLAN DE INVESTIGACIÓN EDITABLE (Si está en planning) */}
      {stage === 'planning' && (
        <div className="bg-white p-4 rounded-xl border border-[#cbd5e1] space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#141413] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
              Plan de investigación sugerido (Editable antes de ejecutar)
            </h4>
            <span className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded">
              Paso 1 de 3
            </span>
          </div>

          <p className="text-[11px] text-[#64748b]">
            Revisa las etapas que el agente autónomo recorrerá. Puedes añadir o eliminar pasos antes de iniciar la búsqueda multi-fuente en segundo plano:
          </p>

          {/* Lista de pasos editables */}
          <div className="space-y-1.5">
            {steps.map((step, idx) => (
              <div
                key={step.id || idx}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-5 h-5 rounded-full bg-[#ede9fe] text-[#4f46e5] text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-[#1e293b]">{step.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStep(step.id)}
                  className="text-[#94a3b8] hover:text-rose-600 transition p-1"
                  title="Eliminar paso"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Añadir nuevo paso */}
          {isAddingStep ? (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="Escribe el nuevo paso de investigación..."
                className="flex-1 bg-white border border-[#4f46e5] rounded-lg px-3 py-1.5 text-xs text-[#141413] focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
              />
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-1.5 rounded-lg bg-[#4f46e5] text-white font-semibold text-xs hover:bg-[#3730a3] transition"
              >
                Añadir
              </button>
              <button
                type="button"
                onClick={() => setIsAddingStep(false)}
                className="px-2 py-1.5 rounded-lg border border-[#cbd5e1] text-[#64748b] text-xs"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingStep(true)}
              className="text-[11px] text-[#4f46e5] hover:text-[#3730a3] font-semibold flex items-center gap-1 cursor-pointer pt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir paso al plan</span>
            </button>
          )}

          {/* Botón Principal para Aprobar y Ejecutar en Segundo Plano */}
          <div className="pt-2 border-t border-[#f1f5f9] flex justify-end">
            <button
              type="button"
              onClick={handleApproveAndRun}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Aprobar y Ejecutar Investigación en Segundo Plano</span>
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 2: PROGRESO EN SEGUNDO PLANO (Si está executing o completed) */}
      {(stage === 'executing' || stage === 'completed') && (
        <div className="bg-white p-3.5 rounded-xl border border-[#e2e8f0] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#1e293b] flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#4f46e5]" />
              {stage === 'executing'
                ? `Rastreando etapa ${currentStepIndex + 1}: ${steps[currentStepIndex]?.title || 'Analizando fuentes...'}`
                : 'Metodología y rastreo multi-fuente finalizado'}
            </span>
            <span className="text-[#4f46e5] font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowSteps(!showSteps)}
            className="w-full pt-1 flex items-center justify-between text-[11px] text-[#4f46e5] hover:text-[#3730a3] font-medium transition cursor-pointer"
          >
            <span>Ver {steps.length} etapas ejecutadas por el agente</span>
            {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showSteps && (
            <div className="pt-2 space-y-2 border-t border-[#f1f5f9] animate-fadeIn">
              {steps.map((step, idx) => {
                const isDone = stage === 'completed' || idx < currentStepIndex;
                const isRunning = stage === 'executing' && idx === currentStepIndex;

                return (
                  <div key={step.id || idx} className="flex items-start gap-2 text-[11px]">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : isRunning ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#cbd5e1] shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className={`font-semibold ${isDone ? 'text-[#1e293b]' : isRunning ? 'text-[#4f46e5]' : 'text-[#94a3b8]'}`}>
                        {step.title}
                      </span>
                      {step.detail && <p className="text-[#64748b] text-[10px] mt-0.5">{step.detail}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ETAPA 3: INFORME EXHAUSTIVO FINAL (Cuando completed) */}
      {stage === 'completed' && (
        <>
          {/* Resumen Ejecutivo */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] space-y-2">
            <h4 className="text-xs font-bold text-[#141413] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Resumen Ejecutivo
            </h4>
            <p className="text-xs text-[#334155] leading-relaxed">
              {report.executiveSummary}
            </p>
          </div>

          {/* Hallazgos e Insights Clave */}
          {report.keyInsights && report.keyInsights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#141413]">
                Hallazgos e Hipótesis Validadas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {report.keyInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] transition"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-[#1e293b]">{insight.title}</span>
                      {insight.tag && (
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-[#f1f5f9] text-[#475569] font-medium">
                          {insight.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748b] leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fuentes y Citas Consultadas */}
          {report.sources && report.sources.length > 0 && (
            <div className="bg-white p-3.5 rounded-xl border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setShowSources(!showSources)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#141413] cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#2a7b9b]" />
                  <span>Fuentes y referencias citadas ({report.sources.length})</span>
                </div>
                {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSources && (
                <div className="mt-3 space-y-2 pt-2 border-t border-[#f1f5f9] animate-fadeIn">
                  {report.sources.map((src, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]/70"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-[11px] text-[#1e293b]">{src.title}</span>
                        <span className="text-[10px] text-[#64748b] block">{src.domain}</span>
                        {src.snippet && <p className="text-[10px] text-[#64748b] italic mt-0.5">"{src.snippet}"</p>}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5 shrink-0">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        {src.reliability}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botón de exportación del informe final */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="px-3.5 py-1.5 rounded-xl bg-[#2a7b9b] hover:bg-[#1f5f78] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Informe Completo (.md)</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
