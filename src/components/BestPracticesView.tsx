import React, { useState } from 'react';
import {
  BookOpen,
  Boxes,
  ArrowLeftRight,
  ShieldAlert,
  RotateCw,
  Lock,
  CheckCircle2,
  Lightbulb,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { bestPracticesData } from '../data/bestPractices';

export const BestPracticesView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(bestPracticesData[0].id);

  const activeTopic = bestPracticesData.find((t) => t.id === selectedId) || bestPracticesData[0];

  const getTopicIcon = (category: string) => {
    switch (category) {
      case 'Organizacao':
        return <Boxes className="w-5 h-5 text-amber-400" />;
      case 'Controle':
        return <ArrowLeftRight className="w-5 h-5 text-blue-400" />;
      case 'Obsolescencia':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Rotatividade':
        return <RotateCw className="w-5 h-5 text-emerald-400" />;
      case 'Seguranca':
        return <Lock className="w-5 h-5 text-purple-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Manual de Excelência Operacional
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Boas Práticas para Gestão de Estoque & Almoxarifado
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Diretrizes fundamentais para otimização de espaço, acurácia de inventário, mitigação de perdas e conformidade contábil.
            </p>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 text-right">
            <div className="text-[11px] text-slate-400">Responsável Técnico</div>
            <div className="text-xs font-bold text-amber-400">[SEU NOME AQUI]</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              Normas ABNT & ISO
            </div>
          </div>
        </div>
      </div>

      {/* Navegação e Conteúdo das 5 Áreas Obrigatórias */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Menu Lateral de Tópicos */}
        <div className="lg:col-span-4 space-y-2">
          {bestPracticesData.map((topic) => {
            const isSelected = selectedId === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedId(topic.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-md shadow-amber-500/5'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                    {getTopicIcon(topic.category)}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                      {topic.title.split('(')[0].trim()}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {topic.summary}
                    </p>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Painel com Detalhes do Tópico Ativo */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                {getTopicIcon(activeTopic.category)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Diretriz Técnica #{activeTopic.id.split('-')[1]}
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {activeTopic.title}
                </h2>
              </div>
            </div>

            {/* Resumo & Regra de Ouro */}
            <div className="mt-5 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeTopic.summary}
              </p>

              <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wider text-[10px] mb-1">
                  <Award className="w-4 h-4 text-amber-400" />
                  Regra Prática do Almoxarife
                </div>
                <div className="font-semibold text-slate-100">
                  {activeTopic.practicalRule}
                </div>
              </div>

              {/* Lista de Diretrizes */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Recomendações Práticas e Procedimentos Operacionais:
                </h3>

                <div className="space-y-2.5">
                  {activeTopic.guidelines.map((guideline, idx) => {
                    const [heading, ...rest] = guideline.split(':');
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-300">
                          {rest.length > 0 ? (
                            <>
                              <strong className="text-white">{heading}:</strong>
                              {rest.join(':')}
                            </>
                          ) : (
                            guideline
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Manual do Almoxarifado • Diretrizes Validadas</span>
            <span className="font-mono">Doc. Rev. 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
