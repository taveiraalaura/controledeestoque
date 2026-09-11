import React, { useState } from 'react';
import { Lock, User, Key, Shield, Check, X } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>(currentUser.role);
  const [name, setName] = useState<string>(currentUser.name);
  const [password, setPassword] = useState<string>('••••••••');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: selectedRole === 'GESTOR' ? 'usr-1' : 'usr-2',
      name: name.trim() || (selectedRole === 'GESTOR' ? '[SEU NOME AQUI]' : 'Operador de Estoque'),
      role: selectedRole,
      email: selectedRole === 'GESTOR' ? 'gestao.almoxarifado@empresa.com' : 'operacao@empresa.com',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Controle de Acesso & Usuário
              </h3>
              <p className="text-[11px] text-slate-400">
                Alterne perfis de acesso ao sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Perfil de Acesso */}
          <div>
            <label className="block text-slate-400 font-semibold mb-2">
              Selecione o Perfil
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('GESTOR');
                  setName('[SEU NOME AQUI]');
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedRole === 'GESTOR'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white text-xs">Gestor / Chefe</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Acesso total ao sistema</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('OPERADOR');
                  setName('Operador Almoxarifado');
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedRole === 'OPERADOR'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white text-xs">Operador / Fiscal</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Movimentações e consultas</div>
              </button>
            </div>
          </div>

          {/* Nome do Usuário */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Nome do Usuário Ativo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors cursor-pointer"
            >
              Confirmar Acesso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
