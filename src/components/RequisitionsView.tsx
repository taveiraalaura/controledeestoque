import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Printer,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  AlertTriangle,
  X,
  FileText,
  DollarSign,
  Download,
  Boxes,
  Eye,
} from 'lucide-react';
import { Requisition, Material, Sector, RequisitionItem } from '../types';
import { formatCurrency, formatDateTime, formatDate, generateRequisitionPDF } from '../services/pdfService';

interface RequisitionsViewProps {
  requisitions: Requisition[];
  materials: Material[];
  sectors: Sector[];
  onCreateRequisition: (data: any) => Promise<void>;
  onUpdateStatus: (id: string, status: string, autoCreateMovements?: boolean) => Promise<void>;
  onDeleteRequisition: (id: string) => Promise<void>;
}

export const RequisitionsView: React.FC<RequisitionsViewProps> = ({
  requisitions,
  materials,
  sectors,
  onCreateRequisition,
  onUpdateStatus,
  onDeleteRequisition,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');

  // Modal de Criação
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal de Visualização
  const [viewingReq, setViewingReq] = useState<Requisition | null>(null);

  // Form State para Nova Requisição
  const [selectedSectorId, setSelectedSectorId] = useState(sectors[0]?.id || '');
  const [requesterName, setRequesterName] = useState('');
  const [priority, setPriority] = useState<'BAIXA' | 'NORMAL' | 'URGENTE'>('NORMAL');
  const [notes, setNotes] = useState('');
  const [itemsList, setItemsList] = useState<Array<{ materialId: string; quantity: number }>>([
    { materialId: materials[0]?.id || '', quantity: 1 },
  ]);

  const handleOpenCreate = () => {
    setSelectedSectorId(sectors[0]?.id || '');
    setRequesterName('');
    setPriority('NORMAL');
    setNotes('');
    setItemsList([{ materialId: materials[0]?.id || '', quantity: 1 }]);
    setErrorMessage(null);
    setIsCreateOpen(true);
  };

  const handleAddItem = () => {
    const availableMat = materials.find((m) => !itemsList.some((it) => it.materialId === m.id)) || materials[0];
    if (availableMat) {
      setItemsList([...itemsList, { materialId: availableMat.id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (itemsList.length <= 1) return;
    setItemsList(itemsList.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'materialId' | 'quantity', value: any) => {
    const updated = [...itemsList];
    updated[index] = { ...updated[index], [field]: value };
    setItemsList(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectorId) {
      setErrorMessage('Selecione o setor solicitante.');
      return;
    }
    if (!requesterName.trim()) {
      setErrorMessage('Informe o nome do solicitante.');
      return;
    }
    if (itemsList.length === 0) {
      setErrorMessage('Adicione pelo menos um item à requisição.');
      return;
    }

    // Valida itens
    for (const it of itemsList) {
      if (!it.materialId) {
        setErrorMessage('Selecione um material para cada linha da requisição.');
        return;
      }
      if (it.quantity <= 0) {
        setErrorMessage('A quantidade de cada material deve ser maior que zero.');
        return;
      }
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      await onCreateRequisition({
        sectorId: selectedSectorId,
        requesterName: requesterName.trim(),
        priority,
        notes: notes.trim() || undefined,
        items: itemsList.map((it) => ({
          materialId: it.materialId,
          quantityRequested: Number(it.quantity),
        })),
      });

      setIsCreateOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao emitir requisição.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintPDF = (req: Requisition) => {
    generateRequisitionPDF(req);
  };

  const handleStatusChange = async (id: string, newStatus: string, autoMovement: boolean = true) => {
    try {
      await onUpdateStatus(id, newStatus, autoMovement);
      if (viewingReq && viewingReq.id === id) {
        setViewingReq(null);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status da requisição.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente cancelar e excluir esta requisição?')) return;
    try {
      await onDeleteRequisition(id);
      if (viewingReq?.id === id) setViewingReq(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir requisição.');
    }
  };

  // Filtros
  const filteredRequisitions = requisitions.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (sectorFilter !== 'ALL' && r.sectorId !== sectorFilter) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        r.code.toLowerCase().includes(q) ||
        r.sectorName.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        r.items.some((it) => it.materialName.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Cálculo total provisório no formulário
  const formCalculatedTotal = itemsList.reduce((acc, it) => {
    const m = materials.find((mat) => mat.id === it.materialId);
    return acc + (m ? m.unitPrice * (Number(it.quantity) || 0) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-amber-400" />
            Requisições de Materiais & Impressão PDF
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gere ordens de requisição com atendimento imediato e emissão de comprovantes oficiais em PDF.
          </p>
        </div>

        <button
          id="btn-criar-requisicao"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Requisição
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Busca */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, setor, solicitante ou material..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-500"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Status: Todos</option>
              <option value="PENDENTE">Apenas Pendentes</option>
              <option value="APROVADA">Aprovadas</option>
              <option value="ATENDIDA">Atendidas / Entregues</option>
              <option value="REJEITADA">Rejeitadas</option>
            </select>
          </div>

          {/* Setor */}
          <div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Setor: Todos</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Listagem de Requisições */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Data / Hora</th>
                <th className="py-3 px-4 font-semibold">Setor & Solicitante</th>
                <th className="py-3 px-4 font-semibold text-center">Prioridade</th>
                <th className="py-3 px-4 font-semibold">Itens Solicitados</th>
                <th className="py-3 px-4 font-semibold text-right">Valor Total</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhuma requisição encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRequisitions.map((req) => {
                  const isPendente = req.status === 'PENDENTE';
                  const isAtendida = req.status === 'ATENDIDA';
                  const isRejeitada = req.status === 'REJEITADA';

                  return (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {req.code}
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {formatDateTime(req.date)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          {req.sectorName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          {req.requesterName}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.priority === 'URGENTE'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : req.priority === 'NORMAL'
                              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200">
                          {req.items.length} {req.items.length === 1 ? 'item' : 'itens'}:
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {req.items.map((it) => `${it.quantityRequested} ${it.unit} ${it.materialName}`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-white font-mono">
                        {formatCurrency(req.totalValue)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAtendida
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isPendente
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : isRejeitada
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {isAtendida && <CheckCircle2 className="w-3 h-3" />}
                          {isPendente && <Clock className="w-3 h-3" />}
                          {isRejeitada && <XCircle className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Imprimir / Baixar PDF */}
                          <button
                            onClick={() => handlePrintPDF(req)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold text-[11px] border border-slate-700 transition-colors cursor-pointer"
                            title="Imprimir Requisição em PDF"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-400" />
                            <span>PDF</span>
                          </button>

                          {/* Visualizar / Detalhes */}
                          <button
                            onClick={() => setViewingReq(req)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title="Ver detalhes da requisição"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Se pendente: Ação rápida de Atender */}
                          {isPendente && (
                            <button
                              onClick={() => handleStatusChange(req.id, 'ATENDIDA', true)}
                              className="p-1.5 rounded-lg hover:bg-emerald-950/60 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                              title="Atender e dar baixa automática no estoque"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Excluir */}
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Excluir requisição"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Nova Requisição */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                Nova Requisição de Materiais
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Setor e Solicitante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Setor Requisitante *
                  </label>
                  <select
                    value={selectedSectorId}
                    onChange={(e) => setSelectedSectorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 font-medium"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.costCenter})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Nome do Requisitante / Solicitante *
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                    placeholder="ex: Renata Albuquerque"
                  />
                </div>
              </div>

              {/* Prioridade */}
              <div className="w-full sm:w-1/2">
                <label className="block text-slate-400 font-semibold mb-1">
                  Prioridade de Atendimento *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENTE">Urgente (Imediato)</option>
                  <option value="BAIXA">Baixa</option>
                </select>
              </div>

              {/* Lista Dinâmica de Itens */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    Itens a Requisitar
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Outro Item
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {itemsList.map((item, idx) => {
                    const mat = materials.find((m) => m.id === item.materialId);
                    const lineTotal = mat ? mat.unitPrice * item.quantity : 0;

                    return (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2"
                      >
                        <div className="flex-1 w-full sm:w-auto">
                          <select
                            value={item.materialId}
                            onChange={(e) => handleItemChange(idx, 'materialId', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-xs"
                          >
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.code} - {m.name} (Saldo: {m.currentStock} {m.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24 shrink-0">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded px-2 py-1.5 focus:outline-none focus:border-amber-400 text-center font-bold text-xs"
                            placeholder="Qtd."
                          />
                        </div>

                        <div className="w-28 shrink-0 text-right font-mono text-slate-300 text-xs font-semibold">
                          {formatCurrency(lineTotal)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={itemsList.length <= 1}
                          className="p-1.5 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Justificativa / Observações */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Justificativa / Observações
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 resize-none"
                  placeholder="Finalidade da requisição, projeto, prazo de entrega desejado..."
                />
              </div>

              {/* Totalizador */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="text-slate-400 font-medium">Valor Total da Requisição:</span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {formatCurrency(formCalculatedTotal)}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Emitindo...' : 'Criar Requisição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Requisição (com botão de PDF) */}
      {viewingReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-none">
                    Requisição {viewingReq.code}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Emitida em {formatDateTime(viewingReq.date)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingReq(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Informações da Requisição */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Setor</div>
                  <div className="font-semibold text-white mt-0.5">{viewingReq.sectorName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Solicitante</div>
                  <div className="font-semibold text-white mt-0.5">{viewingReq.requesterName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Prioridade</div>
                  <div className="font-semibold text-amber-400 mt-0.5">{viewingReq.priority}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Status</div>
                  <div className="font-semibold text-emerald-400 mt-0.5">{viewingReq.status}</div>
                </div>
              </div>

              {/* Tabela de Itens da Requisição */}
              <div>
                <div className="text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-2">
                  Itens Requisitados
                </div>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Material</th>
                        <th className="py-2 px-3 text-center">Unid.</th>
                        <th className="py-2 px-3 text-right">Qtd.</th>
                        <th className="py-2 px-3 text-right">Preço Unit.</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {viewingReq.items.map((it, idx) => (
                        <tr key={idx} className="text-slate-200">
                          <td className="py-2 px-3 font-mono text-amber-400">{it.materialCode}</td>
                          <td className="py-2 px-3 font-medium text-white">{it.materialName}</td>
                          <td className="py-2 px-3 text-center text-slate-400">{it.unit}</td>
                          <td className="py-2 px-3 text-right font-bold text-white">{it.quantityRequested}</td>
                          <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-400">{formatCurrency(it.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-950 font-semibold border-t border-slate-800">
                      <tr>
                        <td colSpan={5} className="py-2 px-3 text-right text-slate-300">
                          VALOR TOTAL CONSOLIDADO:
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-400">
                          {formatCurrency(viewingReq.totalValue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Justificativa */}
              {viewingReq.notes && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                    Justificativa e Observações
                  </div>
                  <div className="text-slate-300 italic">{viewingReq.notes}</div>
                </div>
              )}

              {/* Barra de Ações do Modal */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handlePrintPDF(viewingReq)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / Baixar em PDF
                </button>

                <div className="flex items-center gap-2">
                  {viewingReq.status === 'PENDENTE' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(viewingReq.id, 'REJEITADA', false)}
                        className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => handleStatusChange(viewingReq.id, 'ATENDIDA', true)}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer"
                      >
                        Atender Requisição (Baixa no Estoque)
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setViewingReq(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
