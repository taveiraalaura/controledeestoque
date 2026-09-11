import React from 'react';
import { X, BookOpen, CheckCircle2, Award, Lightbulb } from 'lucide-react';
import { bestPracticesData } from '../data/bestPractices';

interface BestPracticesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BestPracticesModal: React.FC<BestPracticesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Guia Rápido: Boas Práticas de Almoxarifado
              </h3>
              <p className="text-[11px] text-slate-400">
                Instruções consolidadas para controle, acurácia e segurança no estoque
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {bestPracticesData.map((topic) => (
            <div
              key={topic.id}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {topic.title}
                </h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {topic.summary}
              </p>

              <div className="p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-200 text-[11px]">
                <strong className="text-amber-300">Regra Prática: </strong>
                {topic.practicalRule}
              </div>

              <div className="space-y-1.5 pt-1">
                {topic.guidelines.map((g, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-400">
            Responsável Técnico: <strong className="text-amber-400">Laura Taveira</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
