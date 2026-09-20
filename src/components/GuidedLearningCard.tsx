import React, { useState } from 'react';
import {
  GraduationCap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Briefcase,
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  MessageCircleQuestion,
  Send
} from 'lucide-react';
import { GuidedLearningSession, FlashcardItem } from '../types';

interface GuidedLearningCardProps {
  session: GuidedLearningSession;
  onAnswerSelected?: (questionId: string, answerIndex: number) => void;
  onNextStep?: (nextPrompt: string) => void;
  onSendChatFollowup?: (prompt: string) => void;
}

export const GuidedLearningCard: React.FC<GuidedLearningCardProps> = ({
  session,
  onAnswerSelected,
  onNextStep,
  onSendChatFollowup,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(
    session.quiz?.selectedAnswer ?? null
  );
  const [showExplanation, setShowExplanation] = useState(
    session.quiz?.selectedAnswer !== undefined
  );

  // Flashcards interactivas
  const defaultFlashcards: FlashcardItem[] = session.flashcards && session.flashcards.length > 0
    ? session.flashcards
    : [
        {
          id: 'fc-1',
          term: 'Cualificación BANT',
          category: 'Ventas BDR',
          definition: 'Framework que evalúa Presupuesto (Budget), Autoridad (Authority), Necesidad (Need) y Tiempo (Timeline) antes de agendar demo.',
          mnemonic: 'Regla nemotécnica: "¿Quién tiene la Pasta, el Poder, el Dolor y la Prisa?"'
        },
        {
          id: 'fc-2',
          term: 'Cadencia Multicanal',
          category: 'Outbound',
          definition: 'Secuencia estructurada de toques (Email, Teléfono, LinkedIn, Video personalizado) espaciada a lo largo de 14 a 21 días.',
          mnemonic: 'Regla 3x3: 3 canales distintos cada 3 días hábiles.'
        },
        {
          id: 'fc-3',
          term: 'Cold Calling Hook (Gancho)',
          category: 'Prospección Telefónica',
          definition: 'Primeros 7 segundos de una llamada en frío donde se desarma el rechazo reactivo mediante relevancia y permiso contextual.',
          mnemonic: 'P-P-P: Problema común del sector, Prueba social breve y Permiso para una pregunta rápida.'
        }
      ];

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSelectOption = (idx: number) => {
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (session.quiz && onAnswerSelected) {
      onAnswerSelected(session.quiz.id, idx);
    }
  };

  const isCorrect =
    selectedAnswer !== null &&
    session.quiz !== undefined &&
    selectedAnswer === session.quiz.correctIndex;

  const currentFlashcard = defaultFlashcards[activeCardIndex];

  return (
    <div className="mt-3 bg-gradient-to-br from-[#fffbeb] via-white to-[#fef3c7]/30 border border-[#fde68a] rounded-2xl p-4 sm:p-5 shadow-xs text-xs space-y-4">
      {/* Cabecera del módulo formativo */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#fef3c7]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d97706] to-[#b45309] text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#141413] text-sm">Tutor Socrático de Aprendizaje</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                Nivel {session.level}
              </span>
            </div>
            <p className="text-[11px] text-[#78350f] font-medium">
              Tema: {session.topic}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-[#92400e] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          Objetivo: {session.objective}
        </div>
      </div>

      {/* Concepto Clave estructurado */}
      <div className="bg-white p-3.5 rounded-xl border border-[#fef3c7] shadow-2xs space-y-2">
        <h4 className="text-xs font-bold text-[#141413] flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          Desglose conceptual guiado
        </h4>
        <p className="text-xs text-[#334155] leading-relaxed">
          {session.conceptSummary}
        </p>
        {session.keyPoints && session.keyPoints.length > 0 && (
          <ul className="space-y-1 pt-1">
            {session.keyPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#475569]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PREGUNTAS REFLEXIVAS SOCRÁTICAS (Guía al usuario sin dar soluciones masticadas) */}
      <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-300/80 space-y-2">
        <h4 className="text-xs font-bold text-[#92400e] flex items-center gap-1.5">
          <MessageCircleQuestion className="w-4 h-4 text-amber-700" />
          Preguntas de Reflexión Socrática (Deduce el principio):
        </h4>
        <p className="text-[11px] text-[#78350f]">
          En lugar de recibir una respuesta automática, analiza estos interrogantes clave para consolidar tu criterio propio:
        </p>

        <div className="space-y-1.5 pt-1">
          {(session.socraticQuestions && session.socraticQuestions.length > 0
            ? session.socraticQuestions
            : [
                '¿Qué consecuencias tendría en la conversión si presentas el precio antes de que el prospecto reconozca su problema prioritario?',
                '¿Por qué crees que un decisor con presupuesto no avanzará si el sponsor interno no tiene urgencia real?',
                '¿Cómo adaptarías el discurso si descubres que tu contacto no tiene poder de firma final?'
              ]
          ).map((question, qIdx) => (
            <div
              key={qIdx}
              className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white border border-amber-200 text-xs group"
            >
              <div className="flex items-start gap-2 flex-1">
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ?
                </span>
                <span className="text-[#334155] font-medium leading-snug">{question}</span>
              </div>
              {onSendChatFollowup && (
                <button
                  type="button"
                  onClick={() => onSendChatFollowup(`Quiero reflexionar sobre esta pregunta del aprendizaje guiado: "${question}"`)}
                  className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-[#92400e] text-[10px] font-semibold border border-amber-300 shrink-0 transition flex items-center gap-1 cursor-pointer"
                  title="Debatir esta pregunta reflexiva con el tutor"
                >
                  <Send className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">Debatir</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* COMPONENTE DE FLASHCARDS INTERACTIVAS */}
      <div className="bg-white p-4 rounded-xl border border-[#fef3c7] space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#141413] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            Flashcards Didácticas Interactivas
          </h4>
          <span className="text-[10px] text-[#78350f] font-semibold bg-amber-50 px-2 py-0.5 rounded">
            Tarjeta {activeCardIndex + 1} de {defaultFlashcards.length}
          </span>
        </div>

        {/* Tarjeta volteable con animación */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative min-h-[130px] rounded-xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 p-4 flex flex-col justify-between cursor-pointer hover:border-amber-400 transition select-none shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[10px] text-[#92400e]">
            <span className="font-bold uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded">
              {currentFlashcard.category || 'Concepto'}
            </span>
            <span className="flex items-center gap-1 text-[#b45309] font-medium group-hover:underline">
              <RotateCw className="w-3 h-3" />
              {isFlipped ? 'Volver al término' : 'Clic para voltear y ver definición'}
            </span>
          </div>

          <div className="py-2 text-center">
            {!isFlipped ? (
              <div>
                <span className="text-[11px] text-[#94a3b8] block mb-1">Término clave:</span>
                <h3 className="text-base sm:text-lg font-bold text-[#141413]">
                  {currentFlashcard.term}
                </h3>
              </div>
            ) : (
              <div className="space-y-1.5 animate-fadeIn">
                <p className="text-xs text-[#1e293b] font-medium leading-relaxed">
                  {currentFlashcard.definition}
                </p>
                {currentFlashcard.mnemonic && (
                  <p className="text-[11px] text-amber-800 font-semibold italic">
                    💡 {currentFlashcard.mnemonic}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="text-[10px] text-center text-[#94a3b8]">
            {isFlipped ? 'Presiona de nuevo para voltear' : 'Pon a prueba tu memoria antes de voltear'}
          </div>
        </div>

        {/* Navegación entre tarjetas */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              setIsFlipped(false);
              setActiveCardIndex(Math.max(0, activeCardIndex - 1));
            }}
            disabled={activeCardIndex === 0}
            className="px-2.5 py-1 rounded-lg border border-[#cbd5e1] text-xs font-semibold text-[#64748b] hover:text-[#141413] disabled:opacity-40 flex items-center gap-1 transition cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <div className="flex gap-1.5">
            {defaultFlashcards.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeCardIndex === i ? 'w-4 bg-[#d97706]' : 'bg-[#cbd5e1]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsFlipped(false);
              setActiveCardIndex(Math.min(defaultFlashcards.length - 1, activeCardIndex + 1));
            }}
            disabled={activeCardIndex === defaultFlashcards.length - 1}
            className="px-2.5 py-1 rounded-lg border border-[#cbd5e1] text-xs font-semibold text-[#64748b] hover:text-[#141413] disabled:opacity-40 flex items-center gap-1 transition cursor-pointer"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QUIZ INTERACTIVO */}
      {session.quiz && (
        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#d97706]" />
            <h4 className="text-xs font-bold text-[#141413]">
              Cuestionario interactivo (Quiz de comprobación):
            </h4>
          </div>

          <p className="text-xs font-medium text-[#1e293b]">
            {session.quiz.question}
          </p>

          {/* Opciones interactivas */}
          <div className="space-y-2">
            {session.quiz.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isThisCorrect = idx === session.quiz?.correctIndex;

              let btnStyle = 'bg-[#f8fafc] border-[#e2e8f0] text-[#334155] hover:bg-[#f1f5f9]';
              if (showExplanation) {
                if (isThisCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                } else if (isSelected && !isThisCorrect) {
                  btnStyle = 'bg-red-50 border-red-300 text-red-900 line-through';
                } else {
                  btnStyle = 'bg-white border-[#e2e8f0] text-[#94a3b8] opacity-70';
                }
              } else if (isSelected) {
                btnStyle = 'bg-amber-50 border-amber-400 text-amber-900 font-semibold';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white border border-current text-[10px] flex items-center justify-center font-mono font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {showExplanation && (
                    <span className="shrink-0 ml-2">
                      {isThisCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isSelected ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explicación pedagógica */}
          {showExplanation && (
            <div
              className={`p-3 rounded-xl border text-[11px] leading-relaxed animate-fadeIn ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1 mb-1">
                {isCorrect ? '¡Correcto!' : 'Comentario explicativo:'}
              </div>
              <p>{session.quiz.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Aplicación práctica empresarial */}
      {session.corporateContext && (
        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/70 text-xs space-y-1">
          <span className="font-semibold text-[#92400e] flex items-center gap-1.5 text-[11px]">
            <Briefcase className="w-3.5 h-3.5 text-amber-700" />
            Caso de aplicación comercial en BDR:
          </span>
          <p className="text-[11px] text-[#78350f] leading-relaxed">
            {session.corporateContext}
          </p>
        </div>
      )}

      {/* Paso siguiente */}
      {session.nextStepPrompt && onNextStep && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-[#78350f]">¿Listo para consolidar el siguiente nivel?</span>
          <button
            type="button"
            onClick={() => onNextStep(session.nextStepPrompt)}
            className="px-3 py-1.5 bg-[#d97706] text-white rounded-xl text-xs font-semibold hover:bg-[#b45309] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>Continuar formación</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
