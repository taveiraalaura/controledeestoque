import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Boxes,
  Check,
  X,
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  Package,
  Layers,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { Material, MaterialCategory, UnitOfMeasure } from '../types';
import { formatCurrency, formatDate } from '../services/pdfService';

interface MaterialsViewProps {
  materials: Material[];
  onSaveMaterial: (material: Partial<Material>) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onQuickMovement: (materialId: string, type: 'ENTRADA' | 'SAIDA') => void;
}

const CATEGORIES: MaterialCategory[] = [
  'Informática & TI',
  'Equipamentos de Proteção (EPI)',
  'Material de Escritório',
  'Limpeza & Higiene',
  'Manutenção & Ferramentas',
  'Embalagens & Logística',
  'Outros',
];

const UNITS: UnitOfMeasure[] = ['UN', 'CX', 'PCT', 'KG', 'L', 'M', 'PAR', 'ROLO'];

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  onSaveMaterial,
  onDeleteMaterial,
  onQuickMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    description: string;
    category: MaterialCategory;
    unit: UnitOfMeasure;
    currentStock: number;
    minStock: number;
    unitPrice: number;
    lotNumber: string;
    expirationDate: string;
    location: string;
  }>({
    code: '',
    name: '',
    description: '',
    category: 'Material de Escritório',
    unit: 'UN',
    currentStock: 0,
    minStock: 5,
    unitPrice: 0,
    lotNumber: '',
    expirationDate: '',
    location: '',
  });

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setFormData({
      code: `MAT-${String(materials.length + 1).padStart(3, '0')}`,
      name: '',
      description: '',
      category: 'Material de Escritório',
      unit: 'UN',
      currentStock: 0,
      minStock: 5,
      unitPrice: 0,
      lotNumber: '',
      expirationDate: '',
      location: '',
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      code: material.code,
      name: material.name,
      description: material.description || '',
      category: material.category,
      unit: material.unit,
      currentStock: material.currentStock,
      minStock: material.minStock,
      unitPrice: material.unitPrice,
      lotNumber: material.lotNumber || '',
      expirationDate: material.expirationDate || '',
      location: material.location || '',
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('O nome do material é obrigatório.');
      return;
    }
    if (formData.unitPrice < 0) {
      setErrorMessage('O preço unitário não pode ser negativo.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const payload: Partial<Material> = {
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock),
        unitPrice: Number(formData.unitPrice),
      };

      if (editingMaterial) {
        payload.id = editingMaterial.id;
      }

      await onSaveMaterial(payload);
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar material.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este material do catálogo? Esta ação não poderá ser desfeita.')) {
      return;
    }

    try {
      setIsDeletingId(id);
      await onDeleteMaterial(id);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir material.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filtros aplicados
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.location && m.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'OUT_OF_STOCK') {
      matchesStatus = m.currentStock <= 0;
    } else if (statusFilter === 'LOW_STOCK') {
      matchesStatus = m.currentStock > 0 && m.currentStock <= m.minStock;
    } else if (statusFilter === 'OK') {
      matchesStatus = m.currentStock > m.minStock;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-400" />
            Gestão de Materiais e Itens
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cadastro de itens, controle de saldos, estoques mínimos, lotes e validades.
          </p>
        </div>

        <button
          id="btn-cadastrar-material"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Material
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, código, descrição ou localização..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-500"
            />
          </div>

          {/* Filtro por Categoria */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Todas as Categorias</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Todos os Status</option>
              <option value="OK">Estoque Adequado</option>
              <option value="LOW_STOCK">Estoque Baixo</option>
              <option value="OUT_OF_STOCK">Zerado / Em Falta</option>
            </select>
          </div>
        </div>

        {/* Informações rápidas de contagem */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div>
            Exibindo <span className="font-semibold text-white">{filteredMaterials.length}</span> de{' '}
            <span className="font-semibold text-white">{materials.length}</span> materiais
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

      {/* Tabela de Materiais */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Material & Descrição</th>
                <th className="py-3 px-4 font-semibold">Categoria</th>
                <th className="py-3 px-4 font-semibold text-center">Unid.</th>
                <th className="py-3 px-4 font-semibold text-right">Saldo Atual</th>
                <th className="py-3 px-4 font-semibold text-right">Mínimo</th>
                <th className="py-3 px-4 font-semibold text-right">Preço Unit.</th>
                <th className="py-3 px-4 font-semibold text-right">Valor Total</th>
                <th className="py-3 px-4 font-semibold text-center">Situação</th>
                <th className="py-3 px-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Nenhum material encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((m) => {
                  const isOutOfStock = m.currentStock <= 0;
                  const isLowStock = m.currentStock > 0 && m.currentStock <= m.minStock;
                  const totalValue = m.currentStock * m.unitPrice;

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-amber-400">
                        {m.code}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {m.name}
                        </div>
                        {m.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                            {m.description}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                          {m.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {m.location}
                            </span>
                          )}
                          {m.lotNumber && (
                            <span>Lote: {m.lotNumber}</span>
                          )}
                          {m.expirationDate && (
                            <span className="text-amber-400/90">
                              Val: {formatDate(m.expirationDate)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                          {m.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-semibold text-slate-300">
                        {m.unit}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-base">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-rose-400'
                              : isLowStock
                              ? 'text-amber-400'
                              : 'text-white'
                          }
                        >
                          {m.currentStock}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-400">
                        {m.minStock}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-300 font-mono">
                        {formatCurrency(m.unitPrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-white font-mono">
                        {formatCurrency(totalValue)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Em Falta
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Estoque Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Normal
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Entrada Rápida */}
                          <button
                            onClick={() => onQuickMovement(m.id, 'ENTRADA')}
                            className="p-1.5 rounded hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                            title="Entrada rápida de material"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded hover:bg-slate-800 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title="Editar dados do material"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            onClick={() => handleDelete(m.id)}
                            disabled={isDeletingId === m.id}
                            className="p-1.5 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer disabled:opacity-50"
                            title="Excluir material"
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

      {/* Modal de Criação / Edição de Material */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                {editingMaterial ? 'Editar Material' : 'Novo Cadastro de Material'}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Código */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Código do Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="ex: MAT-001"
                  />
                </div>

                {/* Categoria */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Nome do Material / Item *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  placeholder="ex: Papel Sulfite A4 75g (Resma 500fls)"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Descrição / Especificação Técnica
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 resize-none"
                  placeholder="Detalhes sobre fabricante, modelo, cor, dimensões ou especificações..."
                />
              </div>

              {/* Unidade, Quantidade Inicial, Mínimo e Preço */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Unidade (UN) *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Qtd. Atual *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Estoque Mínimo *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Preço Unit. (R$) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Lote, Validade e Localização */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Lote do Fabricante
                  </label>
                  <input
                    type="text"
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                    placeholder="ex: LT-2026-99"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Endereço / Prateleira
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                    placeholder="ex: Prateleira B-02"
                  />
                </div>
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
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : editingMaterial ? 'Atualizar Material' : 'Cadastrar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
