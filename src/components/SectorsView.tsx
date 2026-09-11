import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  User,
  Phone,
  Mail,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Search,
} from 'lucide-react';
import { Sector } from '../types';

interface SectorsViewProps {
  sectors: Sector[];
  onSaveSector: (sector: Partial<Sector>) => Promise<void>;
  onDeleteSector: (id: string) => Promise<void>;
}

export const SectorsView: React.FC<SectorsViewProps> = ({
  sectors,
  onSaveSector,
  onDeleteSector,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    costCenter: '',
    responsible: '',
    phone: '',
    email: '',
    description: '',
  });

  const handleOpenCreate = () => {
    setEditingSector(null);
    setFormData({
      name: '',
      code: `SEC-${String(sectors.length + 1).padStart(2, '0')}`,
      costCenter: `CC-${(sectors.length + 1) * 1010}`,
      responsible: '',
      phone: '',
      email: '',
      description: '',
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({
      name: sector.name,
      code: sector.code,
      costCenter: sector.costCenter,
      responsible: sector.responsible,
      phone: sector.phone || '',
      email: sector.email || '',
      description: sector.description || '',
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.costCenter.trim() || !formData.responsible.trim()) {
      setErrorMessage('Nome, Centro de Custo e Responsável são campos obrigatórios.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const payload: Partial<Sector> = {
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim(),
        costCenter: formData.costCenter.trim(),
        responsible: formData.responsible.trim(),
      };

      if (editingSector) {
        payload.id = editingSector.id;
      }

      await onSaveSector(payload);
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar setor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este setor? Esta ação falhará caso haja movimentações ou requisições registradas para ele.')) {
      return;
    }

    try {
      setIsDeletingId(id);
      await onDeleteSector(id);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir setor.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredSectors = sectors.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.costCenter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            Gestão de Setores e Departamentos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cadastre os setores solicitantes com seus centros de custo e gestores responsáveis.
          </p>
        </div>

        <button
          id="btn-cadastrar-setor"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Setor
        </button>
      </div>

      {/* Busca */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar setor por nome, código, responsável ou centro de custo..."
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Grid de Cards dos Setores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSectors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            Nenhum departamento ou setor encontrado.
          </div>
        ) : (
          filteredSectors.map((sector) => (
            <div
              key={sector.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/60 text-blue-300 font-mono text-[11px] font-semibold">
                    {sector.code}
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {sector.costCenter}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-1">
                  {sector.name}
                </h3>

                {sector.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {sector.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Responsável:</span>
                    <span className="font-medium text-white truncate">{sector.responsible}</span>
                  </div>

                  {sector.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-400">Ramal:</span>
                      <span>{sector.phone}</span>
                    </div>
                  )}

                  {sector.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{sector.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(sector)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(sector.id)}
                  disabled={isDeletingId === sector.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro / Edição de Setor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                {editingSector ? 'Editar Setor' : 'Novo Cadastro de Setor'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Código */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Código do Setor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="ex: SEC-TI"
                  />
                </div>

                {/* Centro de Custo */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Centro de Custo (CC) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.costCenter}
                    onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="ex: CC-1010"
                  />
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Nome do Setor / Departamento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  placeholder="ex: Tecnologia da Informação"
                />
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Gestor / Responsável do Setor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                  placeholder="ex: Mariana Lima"
                />
              </div>

              {/* Telefone e E-mail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Telefone / Ramal
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                    placeholder="ex: (11) 3244-1001"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    E-mail do Departamento
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                    placeholder="ex: ti@empresa.com.br"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Descrição e Finalidade
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 resize-none"
                  placeholder="Atividades principais do setor, escopo de solicitações..."
                />
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
                  {isSaving ? 'Salvando...' : editingSector ? 'Atualizar Setor' : 'Cadastrar Setor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
