import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Filter,
  Search,
  Calendar,
  Building2,
  Boxes,
  User,
  AlertTriangle,
  X,
  FileText,
  DollarSign,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Movement, Material, Sector, MovementType } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../services/pdfService';

interface MovementsViewProps {
  movements: Movement[];
  materials: Material[];
  sectors: Sector[];
  onRegisterMovement: (data: any) => Promise<void>;
  preselectedMaterialId?: string;
  preselectedType?: MovementType;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  materials,
  sectors,
  onRegisterMovement,
  preselectedMaterialId,
  preselectedType,
}) => {
  // Filtros
  const [typeFilter, setTypeFilter] = useState<string>(preselectedType || 'ALL');
  const [materialFilter, setMaterialFilter] = useState<string>(preselectedMaterialId || 'ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MovementType>('ENTRADA');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    materialId: preselectedMaterialId || (materials[0]?.id || ''),
    quantity: 1,
    unitPrice: 0,
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    lotNumber: '',
    expirationDate: '',
    invoiceNumber: '',
    sectorId: sectors[0]?.id || '',
    reason: '',
    requesterName: '',
    notes: '',
  });

  const handleOpenModal = (type: MovementType, specificMaterialId?: string) => {
    setModalType(type);
    const targetMatId = specificMaterialId || preselectedMaterialId || (materials[0]?.id || '');
    const targetMat = materials.find((m) => m.id === targetMatId);

    setFormData({
      materialId: targetMatId,
      quantity: 1,
      unitPrice: targetMat ? targetMat.unitPrice : 0,
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      lotNumber: targetMat?.lotNumber || '',
      expirationDate: targetMat?.expirationDate || '',
      invoiceNumber: '',
      sectorId: sectors[0]?.id || '',
      reason: '',
      requesterName: '',
      notes: '',
    });

    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleMaterialChange = (matId: string) => {
    const mat = materials.find((m) => m.id === matId);
    setFormData((prev) => ({
      ...prev,
      materialId: matId,
      unitPrice: mat ? mat.unitPrice : prev.unitPrice,
      lotNumber: mat?.lotNumber || prev.lotNumber,
      expirationDate: mat?.expirationDate || prev.expirationDate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materialId) {
      setErrorMessage('Selecione um material válido.');
      return;
    }
    if (formData.quantity <= 0) {
      setErrorMessage('A quantidade deve ser maior que zero.');
      return;
    }

    const mat = materials.find((m) => m.id === formData.materialId);
    if (!mat) {
      setErrorMessage('Material não localizado no catálogo.');
      return;
    }

    if (modalType === 'SAIDA') {
      if (mat.currentStock < formData.quantity) {
        setErrorMessage(
          `Saldo insuficiente! Disponível em estoque: ${mat.currentStock} ${mat.unit}. Solicitado: ${formData.quantity} ${mat.unit}.`
        );
        return;
      }
      if (!formData.sectorId && !formData.reason.trim()) {
        setErrorMessage('Para saídas, é obrigatório informar o setor solicitante ou motivo da baixa.');
        return;
      }
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      await onRegisterMovement({
        type: modalType,
        materialId: formData.materialId,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        supplier: modalType === 'ENTRADA' ? formData.supplier.trim() : undefined,
        lotNumber: modalType === 'ENTRADA' ? formData.lotNumber.trim() : undefined,
        expirationDate: modalType === 'ENTRADA' ? formData.expirationDate || undefined : undefined,
        invoiceNumber: modalType === 'ENTRADA' ? formData.invoiceNumber.trim() : undefined,
        sectorId: modalType === 'SAIDA' ? formData.sectorId : undefined,
        reason: modalType === 'SAIDA' ? formData.reason.trim() : undefined,
        requesterName: modalType === 'SAIDA' ? formData.requesterName.trim() : undefined,
        notes: formData.notes.trim() || undefined,
        registeredBy: 'Laura Taveira',
      });

      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar movimentação.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtragem dos registros
  const filteredMovements = movements.filter((mov) => {
    if (typeFilter !== 'ALL' && mov.type !== typeFilter) return false;
    if (materialFilter !== 'ALL' && mov.materialId !== materialFilter) return false;
    if (sectorFilter !== 'ALL' && mov.sectorId !== sectorFilter) return false;

    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      if (new Date(mov.date).getTime() < fromTime) return false;
    }

    if (dateTo) {
      const toTime = new Date(dateTo);
      toTime.setHours(23, 59, 59, 999);
      if (new Date(mov.date).getTime() > toTime.getTime()) return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        mov.materialName.toLowerCase().includes(q) ||
        mov.materialCode.toLowerCase().includes(q) ||
        (mov.supplier && mov.supplier.toLowerCase().includes(q)) ||
        (mov.sectorName && mov.sectorName.toLowerCase().includes(q)) ||
        (mov.reason && mov.reason.toLowerCase().includes(q)) ||
        (mov.requesterName && mov.requesterName.toLowerCase().includes(q)) ||
        (mov.invoiceNumber && mov.invoiceNumber.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const totalEntriesValue = filteredMovements
    .filter((m) => m.type === 'ENTRADA')
    .reduce((sum, m) => sum + m.totalPrice, 0);

  const totalExitsValue = filteredMovements
    .filter((m) => m.type === 'SAIDA')
    .reduce((sum, m) => sum + m.totalPrice, 0);

  const selectedMaterial = materials.find((m) => m.id === formData.materialId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-amber-400" />
            Movimentações de Estoque
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registro auditável de todas as entradas, baixas por setor e histórico consolidado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-registrar-entrada"
            onClick={() => handleOpenModal('ENTRADA')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4" />
            Registrar Entrada
          </button>
          <button
            id="btn-registrar-saida"
            onClick={() => handleOpenModal('SAIDA')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            Registrar Saída
          </button>
        </div>
      </div>

      {/* Cards de Resumo da Consulta Filtrada */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">
              Registros no Período
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {filteredMovements.length} movimentações
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-semibold uppercase flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Total Entradas
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {formatCurrency(totalEntriesValue)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Total Saídas
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {formatCurrency(totalExitsValue)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Busca Textual */}
          <div className="sm:col-span-2 lg:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por material, setor, fornecedor ou NF..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-500"
            />
          </div>

          {/* Tipo */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Tipo: Todas as Movimentações</option>
              <option value="ENTRADA">Apenas Entradas</option>
              <option value="SAIDA">Apenas Saídas</option>
            </select>
          </div>

          {/* Material */}
          <div>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Material: Todos</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data Início */}
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Data inicial"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Data Fim */}
          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Data final"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Limpar Filtros */}
        {(typeFilter !== 'ALL' ||
          materialFilter !== 'ALL' ||
          sectorFilter !== 'ALL' ||
          dateFrom ||
          dateTo ||
          searchTerm) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>Filtros ativos aplicados na tabela</span>
            <button
              onClick={() => {
                setTypeFilter('ALL');
                setMaterialFilter('ALL');
                setSectorFilter('ALL');
                setDateFrom('');
                setDateTo('');
                setSearchTerm('');
              }}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabela do Histórico de Movimentações */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Data / Hora</th>
                <th className="py-3 px-4 font-semibold">Código & Material</th>
                <th className="py-3 px-4 font-semibold text-right">Qtd.</th>
                <th className="py-3 px-4 font-semibold text-right">Preço Unit.</th>
                <th className="py-3 px-4 font-semibold text-right">Valor Total</th>
                <th className="py-3 px-4 font-semibold">Origem / Destino / Motivo</th>
                <th className="py-3 px-4 font-semibold">Lote / Doc</th>
                <th className="py-3 px-4 font-semibold">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Nenhuma movimentação encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isEntrada = mov.type === 'ENTRADA';
                  return (
                    <tr key={mov.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            isEntrada
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isEntrada ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {mov.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {formatDateTime(mov.date)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {mov.materialName}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          {mov.materialCode}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-sm text-white">
                        {mov.quantity} {mov.unit}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-300 font-mono">
                        {formatCurrency(mov.unitPrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-white font-mono">
                        {formatCurrency(mov.totalPrice)}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {isEntrada ? (
                          <div>
                            <div className="font-medium text-white flex items-center gap-1">
                              <Truck className="w-3 h-3 text-slate-400" />
                              {mov.supplier || 'Fornecedor Externo'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-white flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-amber-400" />
                              {mov.sectorName || 'Setor Solicitante'}
                            </div>
                            {mov.requesterName && (
                              <div className="text-[11px] text-slate-400">
                                Solicitante: {mov.requesterName}
                              </div>
                            )}
                            {mov.reason && (
                              <div className="text-[10px] text-slate-400 line-clamp-1 italic">
                                Motivo: {mov.reason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {mov.lotNumber && <div>Lote: {mov.lotNumber}</div>}
                        {mov.invoiceNumber && <div>NF: {mov.invoiceNumber}</div>}
                        {mov.requisitionId && <div className="text-amber-400">Req vinculada</div>}
                        {!mov.lotNumber && !mov.invoiceNumber && !mov.requisitionId && '-'}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {mov.registeredBy}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Entrada ou Saída */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`px-6 py-4 border-b border-slate-800 flex items-center justify-between ${
                modalType === 'ENTRADA' ? 'bg-emerald-950/40' : 'bg-amber-950/40'
              }`}
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {modalType === 'ENTRADA' ? (
                  <>
                    <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                    Registrar Entrada de Material (Recebimento)
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5 text-amber-400" />
                    Registrar Saída de Material (Baixa / Distribuição)
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

              {/* Seleção do Material */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Material Selecionado *
                </label>
                <select
                  value={formData.materialId}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 font-medium"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name} (Saldo: {m.currentStock} {m.unit})
                    </option>
                  ))}
                </select>

                {selectedMaterial && (
                  <div className="mt-1.5 p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Saldo em Estoque: <strong className="text-white">{selectedMaterial.currentStock} {selectedMaterial.unit}</strong>
                    </span>
                    <span>
                      Estoque Mínimo: <strong className="text-slate-300">{selectedMaterial.minStock} {selectedMaterial.unit}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Quantidade, Preço Unitário e Data */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Preço Unitário (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Data da Operação *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Campos Específicos para ENTRADA */}
              {modalType === 'ENTRADA' ? (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Fornecedor / Distribuidor
                      </label>
                      <input
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                        placeholder="ex: Distribuidora Suprimentos Ltda"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Número da Nota Fiscal (NF)
                      </label>
                      <input
                        type="text"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 font-mono"
                        placeholder="ex: NF-94821"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Lote de Fabricação
                      </label>
                      <input
                        type="text"
                        value={formData.lotNumber}
                        onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 font-mono"
                        placeholder="ex: LT-2026-X1"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Data de Validade (se aplicável)
                      </label>
                      <input
                        type="date"
                        value={formData.expirationDate}
                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Campos Específicos para SAÍDA */
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Setor Requisitante / Destino *
                      </label>
                      <select
                        value={formData.sectorId}
                        onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                      >
                        {sectors.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} - {s.name} ({s.costCenter})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Nome do Solicitante / Retirado por
                      </label>
                      <input
                        type="text"
                        value={formData.requesterName}
                        onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                        placeholder="ex: Renata Albuquerque"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Motivo da Saída / Aplicação *
                    </label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                      placeholder="ex: Troca preventiva de toners ou consumo interno"
                    />
                  </div>
                </div>
              )}

              {/* Observações Gerais */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Observações e Informações Adicionais
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 resize-none"
                  placeholder="Informações de transporte, condição da embalagem, laudos..."
                />
              </div>

              {/* Valor total calculado */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Valor Total da Operação:</span>
                <span className="font-bold text-base text-amber-400 font-mono">
                  {formatCurrency(formData.quantity * formData.unitPrice)}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2 rounded-lg font-bold text-slate-950 transition-colors cursor-pointer disabled:opacity-50 ${
                    modalType === 'ENTRADA'
                      ? 'bg-emerald-400 hover:bg-emerald-300'
                      : 'bg-amber-400 hover:bg-amber-300'
                  }`}
                >
                  {isSaving ? 'Gravando...' : modalType === 'ENTRADA' ? 'Confirmar Entrada' : 'Confirmar Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
