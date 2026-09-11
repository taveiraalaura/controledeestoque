export type UnitOfMeasure = 'UN' | 'CX' | 'PCT' | 'KG' | 'L' | 'M' | 'PAR' | 'ROLO';

export type MaterialCategory =
  | 'Informática & TI'
  | 'Equipamentos de Proteção (EPI)'
  | 'Material de Escritório'
  | 'Limpeza & Higiene'
  | 'Manutenção & Ferramentas'
  | 'Embalagens & Logística'
  | 'Outros';

export interface Material {
  id: string;
  code: string;
  name: string;
  description: string;
  category: MaterialCategory;
  unit: UnitOfMeasure;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  lotNumber?: string;
  expirationDate?: string; // YYYY-MM-DD
  location?: string; // ex: Prateleira A-02
  createdAt: string;
  updatedAt: string;
}

export interface Sector {
  id: string;
  name: string;
  code: string;
  costCenter: string;
  responsible: string;
  phone?: string;
  email?: string;
  description?: string;
  createdAt: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA';

export interface Movement {
  id: string;
  type: MovementType;
  materialId: string;
  materialName: string;
  materialCode: string;
  unit: UnitOfMeasure;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string; // ISO date
  
  // For ENTRADA:
  supplier?: string;
  lotNumber?: string;
  expirationDate?: string;
  invoiceNumber?: string;
  
  // For SAIDA:
  sectorId?: string;
  sectorName?: string;
  reason?: string;
  requesterName?: string;
  requisitionId?: string;

  notes?: string;
  registeredBy: string;
}

export type RequisitionStatus = 'PENDENTE' | 'APROVADA' | 'ATENDIDA' | 'REJEITADA';

export interface RequisitionItem {
  materialId: string;
  materialName: string;
  materialCode: string;
  unit: UnitOfMeasure;
  quantityRequested: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Requisition {
  id: string;
  code: string; // ex: REQ-2026-001
  sectorId: string;
  sectorName: string;
  requesterName: string;
  date: string; // ISO string
  priority: 'BAIXA' | 'NORMAL' | 'URGENTE';
  status: RequisitionStatus;
  items: RequisitionItem[];
  totalValue: number;
  notes?: string;
  approvedBy?: string;
  dispatchedAt?: string;
  createdAt: string;
}

export type UserRole = 'ADMIN' | 'ALMOXARIFE' | 'GESTOR' | 'OPERADOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sectorName?: string;
}

export type UserProfile = User;

export interface DashboardStats {
  totalItemsCount: number;
  totalStockValue: number;
  totalUnitsInStock: number;
  lowStockItemsCount: number;
  outOfStockCount: number;
  turnoverRate: number; // Taxa de rotatividade (% ou vezes/ano)
  averageStayDays: number; // Tempo médio de permanência em dias
  expiredCount: number;
  nearExpirationCount: number; // Vencem nos próximos 30 dias
  movementsSummary: {
    totalEntries: number;
    totalExits: number;
    entriesValue: number;
    exitsValue: number;
  };
  mostMovedMaterials: Array<{
    materialId: string;
    materialName: string;
    unit: string;
    quantityMoved: number;
    totalValue: number;
    movementCount: number;
  }>;
  stockByCategory: Array<{
    category: string;
    count: number;
    value: number;
  }>;
  recentMovements: Movement[];
  urgentAlerts: Array<{
    type: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'EXPIRED' | 'NEAR_EXPIRATION';
    materialId: string;
    materialName: string;
    detail: string;
    severity: 'critical' | 'warning';
  }>;
}

export interface BestPracticeTip {
  id: string;
  title: string;
  category: 'Organizacao' | 'Controle' | 'Obsolescencia' | 'Rotatividade' | 'Seguranca';
  icon: string;
  summary: string;
  guidelines: string[];
  practicalRule: string;
}
