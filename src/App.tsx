import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { MaterialsView } from './components/MaterialsView';
import { SectorsView } from './components/SectorsView';
import { MovementsView } from './components/MovementsView';
import { RequisitionsView } from './components/RequisitionsView';
import { ReportsView } from './components/ReportsView';
import { BestPracticesView } from './components/BestPracticesView';
import { BestPracticesModal } from './components/BestPracticesModal';
import { AuthModal } from './components/AuthModal';

import {
  Material,
  Sector,
  Movement,
  Requisition,
  DashboardStats,
  UserProfile,
  MovementType,
} from './types';
import {
  fetchDashboardStats,
  fetchMaterials,
  fetchSectors,
  fetchMovements,
  fetchRequisitions,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  createSector,
  updateSector,
  deleteSector,
  createMovement,
  createRequisition,
  updateRequisitionStatus,
  deleteRequisition,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBestPracticesModalOpen, setIsBestPracticesModalOpen] = useState(false);

  // App Data States
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Preselection for movements triggered from other tabs
  const [preselectedMovement, setPreselectedMovement] = useState<{
    materialId?: string;
    type?: MovementType;
  }>({});

  // Active User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-1',
    name: 'Laura Taveira',
    email: 'taveiralaura386@gmail.com',
    role: 'GESTOR',
  });

  // Load all data from the Express backend
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const [statsData, matsData, sectsData, movsData, reqsData] = await Promise.all([
        fetchDashboardStats(),
        fetchMaterials(),
        fetchSectors(),
        fetchMovements(),
        fetchRequisitions(),
      ]);

      setStats(statsData);
      setMaterials(matsData);
      setSectors(sectsData);
      setMovements(movsData);
      setRequisitions(reqsData);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      setLoadError(err.message || 'Erro ao carregar dados do servidor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Material Actions
  const handleSaveMaterial = async (data: Partial<Material>) => {
    if (data.id) {
      await updateMaterial(data.id, data);
    } else {
      await createMaterial(data);
    }
    await loadData();
  };

  const handleDeleteMaterial = async (id: string) => {
    await deleteMaterial(id);
    await loadData();
  };

  const handleQuickMovement = (materialId: string, type: MovementType) => {
    setPreselectedMovement({ materialId, type });
    setActiveTab('movements');
  };

  // Sector Actions
  const handleSaveSector = async (data: Partial<Sector>) => {
    if (data.id) {
      await updateSector(data.id, data);
    } else {
      await createSector(data);
    }
    await loadData();
  };

  const handleDeleteSector = async (id: string) => {
    await deleteSector(id);
    await loadData();
  };

  // Movement Actions
  const handleRegisterMovement = async (data: any) => {
    await createMovement(data);
    await loadData();
  };

  // Requisition Actions
  const handleCreateRequisition = async (data: any) => {
    await createRequisition(data);
    await loadData();
  };

  const handleUpdateRequisitionStatus = async (
    id: string,
    status: string,
    autoCreateMovements?: boolean
  ) => {
    await updateRequisitionStatus(id, status, autoCreateMovements);
    await loadData();
  };

  const handleDeleteRequisition = async (id: string) => {
    await deleteRequisition(id);
    await loadData();
  };

  // Switch tabs
  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Alert count for Sidebar badges
  const pendingRequisitionsCount = requisitions.filter((r) => r.status === 'PENDENTE').length;
  const lowStockCount = stats?.lowStockCount || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenBestPractices={() => setIsBestPracticesModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        pendingRequisitionsCount={pendingRequisitionsCount}
      />

      {/* Main Layout (Sidebar + Content View) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          lowStockCount={lowStockCount}
          pendingRequisitionsCount={pendingRequisitionsCount}
        />

        {/* View Content Area */}
        <main className="flex-1 min-w-0">
          {isLoading && !stats ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm font-medium text-slate-300">
                Carregando sistema de almoxarifado...
              </div>
              <div className="text-xs text-slate-500">
                Sincronizando saldo de materiais, movimentações e relatórios
              </div>
            </div>
          ) : loadError ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center space-y-3">
              <h2 className="text-base font-bold text-rose-400">Falha ao Conectar com o Servidor</h2>
              <p className="text-xs text-rose-300 max-w-md mx-auto">{loadError}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && stats && (
                <DashboardView
                  stats={stats}
                  materials={materials}
                  onNavigateTab={handleNavigate}
                  onQuickMovement={handleQuickMovement}
                />
              )}

              {activeTab === 'materials' && (
                <MaterialsView
                  materials={materials}
                  onSaveMaterial={handleSaveMaterial}
                  onDeleteMaterial={handleDeleteMaterial}
                  onQuickMovement={handleQuickMovement}
                />
              )}

              {activeTab === 'sectors' && (
                <SectorsView
                  sectors={sectors}
                  onSaveSector={handleSaveSector}
                  onDeleteSector={handleDeleteSector}
                />
              )}

              {activeTab === 'movements' && (
                <MovementsView
                  movements={movements}
                  materials={materials}
                  sectors={sectors}
                  onRegisterMovement={handleRegisterMovement}
                  preselectedMaterialId={preselectedMovement.materialId}
                  preselectedType={preselectedMovement.type}
                />
              )}

              {activeTab === 'requisitions' && (
                <RequisitionsView
                  requisitions={requisitions}
                  materials={materials}
                  sectors={sectors}
                  onCreateRequisition={handleCreateRequisition}
                  onUpdateStatus={handleUpdateRequisitionStatus}
                  onDeleteRequisition={handleDeleteRequisition}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView materials={materials} />
              )}

              {activeTab === 'best-practices' && (
                <BestPracticesView />
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer onOpenBestPractices={() => setIsBestPracticesModalOpen(true)} />

      {/* Quick Best Practices Modal */}
      <BestPracticesModal
        isOpen={isBestPracticesModalOpen}
        onClose={() => setIsBestPracticesModalOpen(false)}
      />

      {/* Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
