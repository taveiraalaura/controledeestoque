import React from 'react';
import {
  Package,
  BookOpen,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { User, DashboardStats } from '../types';
import { formatCurrency } from '../services/pdfService';

interface HeaderProps {
  currentUser: User;
  stats?: DashboardStats | null;
  onOpenBestPractices: () => void;
  onOpenLogin: () => void;
  onResetSeed: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  stats,
  onOpenBestPractices,
  onOpenLogin,
  onResetSeed,
  isResetting,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Package className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  ESTOQUE<span className="text-amber-400">PRO</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/80 rounded-full">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestão Integrada de Estoque e Almoxarifado
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar (Desktop) */}
          {stats && (
            <div className="hidden lg:flex items-center gap-4 bg-slate-950/70 border border-slate-800 rounded-lg px-4 py-1.5">
              <div className="flex items-center gap-2 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Patrimônio:</span>
                <span className="font-semibold text-white">
                  {formatCurrency(stats.totalStockValue)}
                </span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-2 text-xs">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">Itens:</span>
                <span className="font-semibold text-white">
                  {stats.totalItemsCount}
                </span>
              </div>
              {(stats.outOfStockCount > 0 || stats.lowStockItemsCount > 0) && (
                <>
                  <div className="w-px h-4 bg-slate-800" />
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      {stats.outOfStockCount + stats.lowStockItemsCount} alertas
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Actions & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão Boas Práticas */}
            <button
              id="btn-boas-praticas-header"
              onClick={onOpenBestPractices}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg transition-colors cursor-pointer"
              title="Guia de Boas Práticas do Almoxarifado"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Boas Práticas</span>
            </button>

            {/* Reset Seed Demo */}
            <button
              id="btn-reset-seed-demo"
              onClick={onResetSeed}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Restaurar dados de exemplo para demonstração"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Dados Demo</span>
            </button>

            {/* Perfil do Usuário */}
            <button
              id="btn-user-profile-header"
              onClick={onOpenLogin}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors text-left cursor-pointer"
              title="Trocar usuário / Perfil"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-medium text-white leading-none">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-400 leading-tight mt-0.5 flex items-center gap-1">
                  <UserCheck className="w-2.5 h-2.5" />
                  {currentUser.role}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
