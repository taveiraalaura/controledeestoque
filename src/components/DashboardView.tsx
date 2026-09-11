import React from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertOctagon,
  Clock,
  RotateCcw,
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  PackageX,
  Sparkles,
} from 'lucide-react';
import { DashboardStats, Material } from '../types';
import { formatCurrency, formatDate } from '../services/pdfService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  materials: Material[];
  onNavigateTab: (tab: any) => void;
  onQuickMovement: (materialId?: string, type?: 'ENTRADA' | 'SAIDA') => void;
}

const CATEGORY_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  materials,
  onNavigateTab,
  onQuickMovement,
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400">
        <div className="flex items-center gap-3">
          <RotateCcw className="w-5 h-5 animate-spin text-amber-400" />
          <span>Carregando indicadores de desempenho do estoque...</span>
        </div>
      </div>
    );
  }

  // Prepara dados para gráfico de Entradas vs Saídas
  const movementCompareData = [
    {
      name: 'Entradas',
      quantidade: stats.movementsSummary.totalEntries,
      valor: stats.movementsSummary.entriesValue,
      fill: '#10B981',
    },
    {
      name: 'Saídas',
      quantidade: stats.movementsSummary.totalExits,
      valor: stats.movementsSummary.exitsValue,
      fill: '#F59E0B',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner de Boas-vindas e Status */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Painel de Inteligência Operacional
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Indicadores de Desempenho do Almoxarifado
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Visão consolidada de rotatividade, valor patrimonial em depósito e alertas de reposição.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-dash-new-movement"
              onClick={() => onQuickMovement(undefined, 'ENTRADA')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4" />
              Nova Entrada
            </button>
            <button
              id="btn-dash-new-requisition"
              onClick={() => onNavigateTab('requisitions')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              Ver Requisições
            </button>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Valor Total do Estoque */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Valor Total em Estoque
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(stats.totalStockValue)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>{stats.totalUnitsInStock} unidades totais</span>
            <span className="text-amber-400 font-medium">{stats.totalItemsCount} materiais</span>
          </div>
        </div>

        {/* KPI 2: Taxa de Rotatividade do Estoque (Giro) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Taxa de Rotatividade
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {stats.turnoverRate}x
            </span>
            <span className="text-xs font-medium text-emerald-400">/ ano</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Giro do almoxarifado</span>
            <span className="text-slate-300 font-medium">Saudável</span>
          </div>
        </div>

        {/* KPI 3: Tempo Médio de Permanência */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tempo Médio de Permanência
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {stats.averageStayDays} dias
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Estadia estimada</span>
            <span className="text-slate-300 font-medium">Controle PEPS</span>
          </div>
        </div>

        {/* KPI 4: Alertas de Reposição e Validade */}
        <div
          onClick={() => onNavigateTab('materials')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-amber-500/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-amber-300">
              Alertas de Atenção
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 tracking-tight">
              {stats.outOfStockCount + stats.lowStockItemsCount + stats.expiredCount + stats.nearExpirationCount}
            </span>
            <span className="text-xs text-slate-400">ocorrências</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span className="text-rose-400 font-medium">{stats.outOfStockCount} zerados</span>
            <span className="text-amber-400 font-medium">{stats.lowStockItemsCount} baixos</span>
            <span className="text-purple-400 font-medium">{stats.expiredCount + stats.nearExpirationCount} val.</span>
          </div>
        </div>
      </div>

      {/* Linha de Alertas Críticos (Validade + Estoque Baixo) */}
      {stats.urgentAlerts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Monitor de Risco: Validades e Estoque Crítico
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('materials')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              Ver todos os materiais <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.urgentAlerts.map((alert, idx) => {
              const isCritical = alert.severity === 'critical';
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-start gap-3 ${
                    isCritical
                      ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                      : 'bg-amber-950/30 border-amber-900/60 text-amber-200'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded mt-0.5 shrink-0 ${
                      isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {alert.type === 'EXPIRED' || alert.type === 'NEAR_EXPIRATION' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <PackageX className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {alert.materialName}
                    </div>
                    <div className="text-[11px] opacity-90 mt-0.5">
                      {alert.detail}
                    </div>
                  </div>
                  <button
                    onClick={() => onQuickMovement(alert.materialId, 'ENTRADA')}
                    className="shrink-0 text-[10px] font-bold px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition-colors cursor-pointer"
                    title="Repor estoque agora"
                  >
                    Repor
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seção Gráfica: Materiais Mais Movimentados & Distribuição por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Materiais Mais Movimentados */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Materiais Mais Movimentados
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Top itens com maior fluxo de saída e entrada recente
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Volume Consolidado
            </span>
          </div>

          <div className="h-64 w-full">
            {stats.mostMovedMaterials.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.mostMovedMaterials}
                  margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="materialName"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickFormatter={(val) => (val.length > 14 ? `${val.slice(0, 12)}...` : val)}
                    interval={0}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: string) => [
                      name === 'quantityMoved' ? `${val} unidades` : formatCurrency(val),
                      name === 'quantityMoved' ? 'Quantidade Movimentada' : 'Valor Total',
                    ]}
                  />
                  <Bar dataKey="quantityMoved" fill="#F59E0B" radius={[4, 4, 0, 0]} name="quantityMoved" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Nenhuma movimentação registrada ainda.
              </div>
            )}
          </div>

          {/* Tabela Resumo dos Top Movimentados */}
          <div className="mt-4 pt-3 border-t border-slate-800 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="pb-2 font-medium">Material</th>
                  <th className="pb-2 font-medium text-center">Unidade</th>
                  <th className="pb-2 font-medium text-right">Qtd. Movimentada</th>
                  <th className="pb-2 font-medium text-right">Valor Movimentado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {stats.mostMovedMaterials.map((m) => (
                  <tr key={m.materialId} className="text-slate-200">
                    <td className="py-2 font-medium text-white">{m.materialName}</td>
                    <td className="py-2 text-center text-slate-400">{m.unit}</td>
                    <td className="py-2 text-right font-semibold text-amber-400">
                      {m.quantityMoved}
                    </td>
                    <td className="py-2 text-right text-slate-300">
                      {formatCurrency(m.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribuição de Patrimônio por Categoria */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Patrimônio por Categoria
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Proporção em valor (R$) em depósito
              </p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {stats.stockByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.stockByCategory}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {stats.stockByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [formatCurrency(val), 'Valor Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">Sem dados suficientes</div>
            )}
          </div>

          {/* Legenda de Categorias */}
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {stats.stockByCategory.map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-300 truncate max-w-[140px]">{cat.category}</span>
                </div>
                <div className="font-semibold text-white">
                  {formatCurrency(cat.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Histórico Recente de Movimentações (Atividades do Almoxarifado) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Últimas Movimentações Registradas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro auditável de baixas e reposições
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('movements')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            Ver histórico completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-2.5 font-semibold">Tipo</th>
                <th className="pb-2.5 font-semibold">Data / Hora</th>
                <th className="pb-2.5 font-semibold">Material</th>
                <th className="pb-2.5 font-semibold text-right">Quantidade</th>
                <th className="pb-2.5 font-semibold">Origem / Destino</th>
                <th className="pb-2.5 font-semibold text-right">Total</th>
                <th className="pb-2.5 font-semibold">Registrado Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats.recentMovements.slice(0, 5).map((mov) => {
                const isEntrada = mov.type === 'ENTRADA';
                return (
                  <tr key={mov.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isEntrada
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isEntrada ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {mov.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{formatDate(mov.date)}</td>
                    <td className="py-2.5">
                      <div className="font-semibold text-white">{mov.materialName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{mov.materialCode}</div>
                    </td>
                    <td className="py-2.5 text-right font-bold text-white">
                      {mov.quantity} {mov.unit}
                    </td>
                    <td className="py-2.5 text-slate-300">
                      {isEntrada ? mov.supplier || 'Fornecedor' : mov.sectorName || 'Setor Requisitante'}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-200">
                      {formatCurrency(mov.totalPrice)}
                    </td>
                    <td className="py-2.5 text-slate-400">{mov.registeredBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
