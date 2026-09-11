import React, { useState } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Search,
  Filter,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  DollarSign,
  Boxes,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Material, MaterialCategory } from '../types';
import { formatCurrency, formatDate, generateStockPositionPDF } from '../services/pdfService';

interface ReportsViewProps {
  materials: Material[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ materials }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'LOW' | 'OK'>('ALL');

  // Cálculos globais do estoque
  const totalStockValue = materials.reduce((acc, m) => acc + m.currentStock * m.unitPrice, 0);
  const totalItems = materials.length;
  const lowStockCount = materials.filter((m) => m.currentStock > 0 && m.currentStock <= m.minStock).length;
  const outOfStockCount = materials.filter((m) => m.currentStock <= 0).length;

  // Filtragem dos dados para a tabela
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.location && m.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'CRITICAL') {
      matchesStatus = m.currentStock <= 0;
    } else if (statusFilter === 'LOW') {
      matchesStatus = m.currentStock > 0 && m.currentStock <= m.minStock;
    } else if (statusFilter === 'OK') {
      matchesStatus = m.currentStock > m.minStock;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredValue = filteredMaterials.reduce((acc, m) => acc + m.currentStock * m.unitPrice, 0);

  const handleExportPDF = () => {
    generateStockPositionPDF(filteredMaterials, {
      totalStockValue,
      totalItems,
      lowStockCount,
      outOfStockCount,
    });
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const categories = Array.from(new Set(materials.map((m) => m.category)));

  return (
    <div className="space-y-6">
      {/* Header com Ações de Impressão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Relatório de Posição Atual do Estoque
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visão patrimonial detalhada, quantitativos por item, curva de valor e alertas de reposição imediata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-imprimir-navegador"
            onClick={handleBrowserPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Imprimir visualização formatada"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Imprimir</span>
          </button>

          <button
            id="btn-gerar-pdf-estoque"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            title="Gerar Relatório Oficial em PDF (A4 Paisagem)"
          >
            <Download className="w-4 h-4" />
            <span>Gerar Relatório em PDF</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo Executivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total em Dinheiro */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Valor Total do Estoque
            </span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(totalStockValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Patrimônio físico em almoxarifado
          </div>
        </div>

        {/* Total de Itens */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Materiais Cadastrados
            </span>
            <Boxes className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {totalItems} materiais
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Itens catalogados ativos
          </div>
        </div>

        {/* Alerta de Estoque Baixo */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'LOW' ? 'ALL' : 'LOW')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-amber-500/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase group-hover:text-amber-300">
              Estoque Baixo
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            {lowStockCount} itens
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Abaixo do estoque mínimo estipulado
          </div>
        </div>

        {/* Itens Zerados / Em Falta */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-rose-500/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase group-hover:text-rose-300">
              Itens em Falta (Zerados)
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            {outOfStockCount} itens
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Saldo 0 • Requer compra urgente
          </div>
        </div>
      </div>

      {/* Painel de Filtros e Busca */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por material, código ou prateleira..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Categoria: Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Situação: Todos os Materiais</option>
              <option value="CRITICAL">Apenas Itens em Falta (Zerados)</option>
              <option value="LOW">Apenas Estoque Baixo</option>
              <option value="OK">Apenas Estoque Normal</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div>
            Mostrando <strong className="text-white">{filteredMaterials.length}</strong> itens • Total Filtrado:{' '}
            <strong className="text-amber-400 font-mono">{formatCurrency(filteredValue)}</strong>
          </div>
          {(searchTerm || selectedCategory !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setStatusFilter('ALL');
              }}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabela do Relatório de Posição de Estoque */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Material</th>
                <th className="py-3 px-4 font-semibold">Categoria</th>
                <th className="py-3 px-4 font-semibold">Localização</th>
                <th className="py-3 px-4 font-semibold text-center">Unid.</th>
                <th className="py-3 px-4 font-semibold text-right">Saldo Atual</th>
                <th className="py-3 px-4 font-semibold text-right">Est. Mínimo</th>
                <th className="py-3 px-4 font-semibold text-right">Preço Unit.</th>
                <th className="py-3 px-4 font-semibold text-right">Valor Total em Estoque</th>
                <th className="py-3 px-4 font-semibold text-center">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Nenhum material encontrado no filtro atual do relatório.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((m) => {
                  const isOutOfStock = m.currentStock <= 0;
                  const isLowStock = m.currentStock > 0 && m.currentStock <= m.minStock;
                  const totalItemVal = m.currentStock * m.unitPrice;

                  // Porcentagem em relação ao mínimo
                  const ratio = m.minStock > 0 ? Math.min(Math.round((m.currentStock / m.minStock) * 100), 200) : 100;

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {m.code}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{m.name}</div>
                        {m.expirationDate && (
                          <div className="text-[10px] text-amber-400 mt-0.5">
                            Validade: {formatDate(m.expirationDate)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {m.category}
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {m.location || '-'}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-300">
                        {m.unit}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-sm font-bold ${
                            isOutOfStock
                              ? 'text-rose-400'
                              : isLowStock
                              ? 'text-amber-400'
                              : 'text-white'
                          }`}
                        >
                          {m.currentStock}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-400 font-mono">
                        {m.minStock}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-300 font-mono">
                        {formatCurrency(m.unitPrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-white font-mono">
                        {formatCurrency(totalItemVal)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <AlertOctagon className="w-3 h-3" />
                            EM FALTA
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            ESTOQUE BAIXO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            NORMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-slate-950 font-semibold border-t border-slate-800 text-xs">
              <tr>
                <td colSpan={8} className="py-3 px-4 text-right text-slate-300 font-bold uppercase">
                  VALOR TOTAL CONSOLIDADO DO ESTOQUE (FILTRO ATUAL):
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-base text-amber-400">
                  {formatCurrency(filteredValue)}
                </td>
                <td className="py-3 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Nota de Auditoria e Responsabilidade */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="font-semibold text-white">Relatório Patrimonial e de Posição de Estoque</span>
          <span className="mx-2 text-slate-600">•</span>
          <span>Responsável Técnico: <strong className="text-amber-400">Laura Taveira</strong></span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Validação Contábil • Almoxarifado Central
        </div>
      </div>
    </div>
  );
};
