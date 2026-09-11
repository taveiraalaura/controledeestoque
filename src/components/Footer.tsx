import React from 'react';
import { ShieldCheck, Code, Sparkles, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-4 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">
            Sistema de Gestão de Estoque e Almoxarifado
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Node.js / Express / React Full-Stack
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-center md:text-right">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span>Responsável Técnico & Desenvolvedor:</span>
            <strong className="text-amber-400 font-semibold">[SEU NOME AQUI]</strong>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>2026 Enterprise Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
