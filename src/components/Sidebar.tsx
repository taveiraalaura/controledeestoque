import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Building2,
  ArrowLeftRight,
  FileCheck2,
  BarChart3,
  BookOpen,
  Award,
  ShieldCheck,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'materials'
  | 'sectors'
  | 'movements'
  | 'requisitions'
  | 'reports'
  | 'best-practices';

interface SidebarProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  pendingRequisitionsCount?: number;
  criticalStockCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onChangeTab,
  pendingRequisitionsCount = 0,
  criticalStockCount = 0,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard Indicadores',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'materials' as TabType,
      label: 'Gestão de Materiais',
      icon: Boxes,
      badge: criticalStockCount > 0 ? `${criticalStockCount} alerta` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'sectors' as TabType,
      label: 'Gestão de Setores',
      icon: Building2,
      badge: null,
    },
    {
      id: 'movements' as TabType,
      label: 'Movimentações',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'requisitions' as TabType,
      label: 'Requisições de Material',
      icon: FileCheck2,
      badge: pendingRequisitionsCount > 0 ? `${pendingRequisitionsCount} pend.` : null,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'reports' as TabType,
      label: 'Relatórios de Posição',
      icon: BarChart3,
      badge: 'PDF',
      badgeColor: 'bg-slate-800 text-amber-400 border border-slate-700',
    },
    {
      id: 'best-practices' as TabType,
      label: 'Boas Práticas de Estoque',
      icon: BookOpen,
      badge: 'Guia',
      badgeColor: 'bg-amber-400/10 text-amber-300 border border-amber-400/20',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Navegação Principal */}
      <div className="p-4 flex-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">
          Módulos do Sistema
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-slate-950' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-slate-950 text-amber-400'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Card de Responsável Técnico e Certificação */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-3.5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Award className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Responsável Técnico
            </span>
          </div>
          <div className="text-xs font-semibold text-white">
            Laura Taveira
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Arquiteto Full-Stack & Gestão
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3 h-3" />
              Almoxarifado Ativo
            </span>
            <span className="text-slate-400 font-mono">v2.4</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
