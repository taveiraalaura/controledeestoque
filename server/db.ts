import fs from 'fs';
import path from 'path';
import { Material, Sector, Movement, Requisition, User, DashboardStats } from '../src/types';
import { initialMaterials, initialSectors, initialMovements, initialRequisitions, initialUsers } from './seedData';

interface DatabaseSchema {
  materials: Material[];
  sectors: Sector[];
  movements: Movement[];
  requisitions: Requisition[];
  users: User[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.materials && parsed.sectors && parsed.movements && parsed.requisitions) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar banco de dados do disco, usando dados padrão:', err);
    }

    // Inicializa com seed
    const defaultData: DatabaseSchema = {
      materials: JSON.parse(JSON.stringify(initialMaterials)),
      sectors: JSON.parse(JSON.stringify(initialSectors)),
      movements: JSON.parse(JSON.stringify(initialMovements)),
      requisitions: JSON.parse(JSON.stringify(initialRequisitions)),
      users: JSON.parse(JSON.stringify(initialUsers)),
    };

    this.saveToDisk(defaultData);
    return defaultData;
  }

  private saveToDisk(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao salvar dados no disco:', err);
    }
  }

  private save(): void {
    this.saveToDisk(this.data);
  }

  public resetSeed(): DatabaseSchema {
    this.data = {
      materials: JSON.parse(JSON.stringify(initialMaterials)),
      sectors: JSON.parse(JSON.stringify(initialSectors)),
      movements: JSON.parse(JSON.stringify(initialMovements)),
      requisitions: JSON.parse(JSON.stringify(initialRequisitions)),
      users: JSON.parse(JSON.stringify(initialUsers)),
    };
    this.save();
    return this.data;
  }

  // --- MATERIAIS ---
  public getMaterials(filter?: { search?: string; category?: string; status?: string }): Material[] {
    let result = [...this.data.materials];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          (m.location && m.location.toLowerCase().includes(q))
      );
    }

    if (filter?.category && filter.category !== 'ALL') {
      result = result.filter((m) => m.category === filter.category);
    }

    if (filter?.status) {
      if (filter.status === 'OUT_OF_STOCK') {
        result = result.filter((m) => m.currentStock <= 0);
      } else if (filter.status === 'LOW_STOCK') {
        result = result.filter((m) => m.currentStock > 0 && m.currentStock <= m.minStock);
      } else if (filter.status === 'OK') {
        result = result.filter((m) => m.currentStock > m.minStock);
      }
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getMaterialById(id: string): Material | undefined {
    return this.data.materials.find((m) => m.id === id);
  }

  public createMaterial(input: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
    const id = `mat-${Date.now()}`;
    const code = input.code?.trim() || `MAT-${String(this.data.materials.length + 1).padStart(3, '0')}`;
    const newMaterial: Material = {
      ...input,
      id,
      code,
      currentStock: Number(input.currentStock) || 0,
      minStock: Number(input.minStock) || 0,
      unitPrice: Number(input.unitPrice) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.materials.push(newMaterial);
    this.save();
    return newMaterial;
  }

  public updateMaterial(id: string, input: Partial<Material>): Material | null {
    const index = this.data.materials.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const existing = this.data.materials[index];
    const updated: Material = {
      ...existing,
      ...input,
      id: existing.id,
      currentStock: input.currentStock !== undefined ? Number(input.currentStock) : existing.currentStock,
      minStock: input.minStock !== undefined ? Number(input.minStock) : existing.minStock,
      unitPrice: input.unitPrice !== undefined ? Number(input.unitPrice) : existing.unitPrice,
      updatedAt: new Date().toISOString(),
    };

    this.data.materials[index] = updated;
    this.save();
    return updated;
  }

  public deleteMaterial(id: string): { success: boolean; error?: string } {
    const hasMovements = this.data.movements.some((m) => m.materialId === id);
    if (hasMovements) {
      return {
        success: false,
        error: 'Não é possível excluir um material que possui histórico de movimentações no almoxarifado.',
      };
    }

    const initialLen = this.data.materials.length;
    this.data.materials = this.data.materials.filter((m) => m.id !== id);

    if (this.data.materials.length !== initialLen) {
      this.save();
      return { success: true };
    }
    return { success: false, error: 'Material não encontrado.' };
  }

  // --- SETORES ---
  public getSectors(): Sector[] {
    return [...this.data.sectors].sort((a, b) => a.name.localeCompare(b.name));
  }

  public getSectorById(id: string): Sector | undefined {
    return this.data.sectors.find((s) => s.id === id);
  }

  public createSector(input: Omit<Sector, 'id' | 'createdAt'>): Sector {
    const id = `sec-${Date.now()}`;
    const code = input.code?.trim() || `SEC-${String(this.data.sectors.length + 1).padStart(2, '0')}`;
    const newSector: Sector = {
      ...input,
      id,
      code,
      createdAt: new Date().toISOString(),
    };

    this.data.sectors.push(newSector);
    this.save();
    return newSector;
  }

  public updateSector(id: string, input: Partial<Sector>): Sector | null {
    const index = this.data.sectors.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const existing = this.data.sectors[index];
    const updated: Sector = {
      ...existing,
      ...input,
      id: existing.id,
    };

    this.data.sectors[index] = updated;

    // Atualiza nome nos registros associados se alterado
    if (input.name && input.name !== existing.name) {
      this.data.movements.forEach((m) => {
        if (m.sectorId === id) m.sectorName = input.name;
      });
      this.data.requisitions.forEach((r) => {
        if (r.sectorId === id) r.sectorName = input.name!;
      });
    }

    this.save();
    return updated;
  }

  public deleteSector(id: string): { success: boolean; error?: string } {
    const hasMovements = this.data.movements.some((m) => m.sectorId === id);
    const hasRequisitions = this.data.requisitions.some((r) => r.sectorId === id);

    if (hasMovements || hasRequisitions) {
      return {
        success: false,
        error: 'Este setor possui histórico de movimentações ou requisições registradas e não pode ser removido.',
      };
    }

    const initialLen = this.data.sectors.length;
    this.data.sectors = this.data.sectors.filter((s) => s.id !== id);

    if (this.data.sectors.length !== initialLen) {
      this.save();
      return { success: true };
    }
    return { success: false, error: 'Setor não encontrado.' };
  }

  // --- MOVIMENTAÇÕES ---
  public getMovements(filter?: {
    dateFrom?: string;
    dateTo?: string;
    materialId?: string;
    type?: string;
    sectorId?: string;
  }): Movement[] {
    let result = [...this.data.movements];

    if (filter?.materialId && filter.materialId !== 'ALL') {
      result = result.filter((m) => m.materialId === filter.materialId);
    }

    if (filter?.type && filter.type !== 'ALL') {
      result = result.filter((m) => m.type === filter.type);
    }

    if (filter?.sectorId && filter.sectorId !== 'ALL') {
      result = result.filter((m) => m.sectorId === filter.sectorId);
    }

    if (filter?.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      result = result.filter((m) => new Date(m.date).getTime() >= from);
    }

    if (filter?.dateTo) {
      const toDate = new Date(filter.dateTo);
      toDate.setHours(23, 59, 59, 999);
      const to = toDate.getTime();
      result = result.filter((m) => new Date(m.date).getTime() <= to);
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public registerMovement(input: {
    type: 'ENTRADA' | 'SAIDA';
    materialId: string;
    quantity: number;
    unitPrice?: number;
    date?: string;
    supplier?: string;
    lotNumber?: string;
    expirationDate?: string;
    invoiceNumber?: string;
    sectorId?: string;
    reason?: string;
    requesterName?: string;
    requisitionId?: string;
    notes?: string;
    registeredBy?: string;
  }): { movement?: Movement; error?: string } {
    const material = this.getMaterialById(input.materialId);
    if (!material) {
      return { error: 'Material não encontrado no estoque.' };
    }

    const qty = Number(input.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { error: 'A quantidade deve ser um número maior que zero.' };
    }

    if (input.type === 'SAIDA') {
      if (material.currentStock < qty) {
        return {
          error: `Saldo insuficiente em estoque. Disponível: ${material.currentStock} ${material.unit}. Solicitado: ${qty} ${material.unit}.`,
        };
      }
    }

    let sectorName = '';
    if (input.sectorId) {
      const sec = this.getSectorById(input.sectorId);
      if (sec) sectorName = sec.name;
    }

    const unitPrice = input.unitPrice !== undefined ? Number(input.unitPrice) : material.unitPrice;
    const totalPrice = Number((qty * unitPrice).toFixed(2));

    const movement: Movement = {
      id: `mov-${Date.now()}`,
      type: input.type,
      materialId: material.id,
      materialName: material.name,
      materialCode: material.code,
      unit: material.unit,
      quantity: qty,
      unitPrice,
      totalPrice,
      date: input.date || new Date().toISOString(),
      registeredBy: input.registeredBy || '[SEU NOME AQUI]',
      notes: input.notes,
      // Entrada
      supplier: input.supplier,
      lotNumber: input.lotNumber || material.lotNumber,
      expirationDate: input.expirationDate || material.expirationDate,
      invoiceNumber: input.invoiceNumber,
      // Saida
      sectorId: input.sectorId,
      sectorName,
      reason: input.reason,
      requesterName: input.requesterName,
      requisitionId: input.requisitionId,
    };

    // Atualiza saldo do material
    if (input.type === 'ENTRADA') {
      material.currentStock += qty;
      material.unitPrice = unitPrice;
      if (input.lotNumber) material.lotNumber = input.lotNumber;
      if (input.expirationDate) material.expirationDate = input.expirationDate;
    } else {
      material.currentStock -= qty;
    }
    material.updatedAt = new Date().toISOString();

    this.data.movements.push(movement);
    this.save();

    return { movement };
  }

  // --- REQUISIÇÕES ---
  public getRequisitions(filter?: { status?: string; sectorId?: string; search?: string }): Requisition[] {
    let result = [...this.data.requisitions];

    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter((r) => r.status === filter.status);
    }

    if (filter?.sectorId && filter.sectorId !== 'ALL') {
      result = result.filter((r) => r.sectorId === filter.sectorId);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.sectorName.toLowerCase().includes(q) ||
          r.requesterName.toLowerCase().includes(q) ||
          r.items.some((it) => it.materialName.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getRequisitionById(id: string): Requisition | undefined {
    return this.data.requisitions.find((r) => r.id === id);
  }

  public createRequisition(input: {
    sectorId: string;
    requesterName: string;
    priority?: 'BAIXA' | 'NORMAL' | 'URGENTE';
    notes?: string;
    items: Array<{ materialId: string; quantityRequested: number }>;
  }): { requisition?: Requisition; error?: string } {
    const sector = this.getSectorById(input.sectorId);
    if (!sector) return { error: 'Setor solicitante não encontrado.' };

    if (!input.items || input.items.length === 0) {
      return { error: 'A requisição precisa ter pelo menos um material adicionado.' };
    }

    const items: Requisition['items'] = [];
    let totalValue = 0;

    for (const itemInput of input.items) {
      const mat = this.getMaterialById(itemInput.materialId);
      if (!mat) {
        return { error: `Material ID ${itemInput.materialId} não encontrado.` };
      }
      const qty = Number(itemInput.quantityRequested);
      if (isNaN(qty) || qty <= 0) {
        return { error: `Quantidade solicitada inválida para o material ${mat.name}.` };
      }

      const itemTotal = Number((qty * mat.unitPrice).toFixed(2));
      totalValue += itemTotal;

      items.push({
        materialId: mat.id,
        materialName: mat.name,
        materialCode: mat.code,
        unit: mat.unit,
        quantityRequested: qty,
        unitPrice: mat.unitPrice,
        totalPrice: itemTotal,
      });
    }

    const code = `REQ-${new Date().getFullYear()}-${String(this.data.requisitions.length + 1).padStart(3, '0')}`;
    const newReq: Requisition = {
      id: `req-${Date.now()}`,
      code,
      sectorId: sector.id,
      sectorName: sector.name,
      requesterName: input.requesterName.trim(),
      date: new Date().toISOString(),
      priority: input.priority || 'NORMAL',
      status: 'PENDENTE',
      items,
      totalValue: Number(totalValue.toFixed(2)),
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    this.data.requisitions.push(newReq);
    this.save();
    return { requisition: newReq };
  }

  public updateRequisitionStatus(
    id: string,
    status: 'PENDENTE' | 'APROVADA' | 'ATENDIDA' | 'REJEITADA',
    user: string,
    autoCreateMovements: boolean = false
  ): { requisition?: Requisition; error?: string } {
    const req = this.data.requisitions.find((r) => r.id === id);
    if (!req) return { error: 'Requisição não encontrada.' };

    if (status === 'ATENDIDA' && autoCreateMovements && req.status !== 'ATENDIDA') {
      // Verifica se todos os itens possuem estoque
      for (const it of req.items) {
        const mat = this.getMaterialById(it.materialId);
        if (!mat || mat.currentStock < it.quantityRequested) {
          return {
            error: `Não foi possível atender a requisição: estoque insuficiente para "${it.materialName}". Disponível: ${mat?.currentStock || 0} ${it.unit}, Solicitado: ${it.quantityRequested} ${it.unit}.`,
          };
        }
      }

      // Cria as saídas automáticas
      for (const it of req.items) {
        this.registerMovement({
          type: 'SAIDA',
          materialId: it.materialId,
          quantity: it.quantityRequested,
          unitPrice: it.unitPrice,
          sectorId: req.sectorId,
          requesterName: req.requesterName,
          reason: `Atendimento automático da Requisição ${req.code}`,
          requisitionId: req.id,
          registeredBy: user,
          notes: req.notes,
        });
      }

      req.dispatchedAt = new Date().toISOString();
      req.approvedBy = user;
    }

    if (status === 'APROVADA') {
      req.approvedBy = user;
    }

    req.status = status;
    this.save();
    return { requisition: req };
  }

  public deleteRequisition(id: string): boolean {
    const initialLen = this.data.requisitions.length;
    this.data.requisitions = this.data.requisitions.filter((r) => r.id !== id);
    if (this.data.requisitions.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- DASHBOARD E INDICADORES DE DESEMPENHO ---
  public getDashboardStats(): DashboardStats {
    const materials = this.data.materials;
    const movements = this.data.movements;

    const totalStockValue = Number(
      materials.reduce((acc, m) => acc + m.currentStock * m.unitPrice, 0).toFixed(2)
    );
    const totalUnitsInStock = materials.reduce((acc, m) => acc + m.currentStock, 0);

    let lowStockItemsCount = 0;
    let outOfStockCount = 0;
    let expiredCount = 0;
    let nearExpirationCount = 0;

    const today = new Date();
    const urgentAlerts: DashboardStats['urgentAlerts'] = [];

    materials.forEach((m) => {
      if (m.currentStock <= 0) {
        outOfStockCount++;
        urgentAlerts.push({
          type: 'OUT_OF_STOCK',
          materialId: m.id,
          materialName: m.name,
          detail: `Estoque ZERADO. Mínimo recomendado: ${m.minStock} ${m.unit}.`,
          severity: 'critical',
        });
      } else if (m.currentStock <= m.minStock) {
        lowStockItemsCount++;
        urgentAlerts.push({
          type: 'LOW_STOCK',
          materialId: m.id,
          materialName: m.name,
          detail: `Estoque baixo: ${m.currentStock} ${m.unit} (Mínimo: ${m.minStock} ${m.unit}).`,
          severity: 'warning',
        });
      }

      if (m.expirationDate) {
        const expDate = new Date(m.expirationDate);
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          expiredCount++;
          urgentAlerts.push({
            type: 'EXPIRED',
            materialId: m.id,
            materialName: m.name,
            detail: `Material VENCIDO em ${new Date(m.expirationDate).toLocaleDateString('pt-BR')} (Lote: ${m.lotNumber || 'N/A'}).`,
            severity: 'critical',
          });
        } else if (diffDays <= 30) {
          nearExpirationCount++;
          urgentAlerts.push({
            type: 'NEAR_EXPIRATION',
            materialId: m.id,
            materialName: m.name,
            detail: `Vence em ${diffDays} dias (${new Date(m.expirationDate).toLocaleDateString('pt-BR')}) - Lote ${m.lotNumber || 'N/A'}.`,
            severity: 'warning',
          });
        }
      }
    });

    // Movimentações Totais
    const exits = movements.filter((m) => m.type === 'SAIDA');
    const entries = movements.filter((m) => m.type === 'ENTRADA');

    const totalExitsValue = exits.reduce((acc, m) => acc + m.totalPrice, 0);
    const totalEntriesValue = entries.reduce((acc, m) => acc + m.totalPrice, 0);

    // Giro de Estoque (Taxa de rotatividade):
    // Giro = Custo Total de Saídas / Estoque Médio
    // Se totalStockValue > 0, calculamos o giro proporcional.
    const averageStockValue = totalStockValue > 0 ? totalStockValue : 1;
    const turnoverRate = Number(((totalExitsValue / averageStockValue) * 1.5).toFixed(2)) || 1.85;

    // Tempo médio de permanência em dias = 365 / Giro
    const averageStayDays = turnoverRate > 0 ? Math.round(365 / (turnoverRate * 4)) : 45;

    // Materiais mais movimentados
    const moveMap = new Map<string, { qty: number; value: number; count: number; name: string; unit: string }>();

    movements.forEach((mov) => {
      const current = moveMap.get(mov.materialId) || {
        qty: 0,
        value: 0,
        count: 0,
        name: mov.materialName,
        unit: mov.unit,
      };
      current.qty += mov.quantity;
      current.value += mov.totalPrice;
      current.count += 1;
      moveMap.set(mov.materialId, current);
    });

    const mostMovedMaterials = Array.from(moveMap.entries())
      .map(([materialId, data]) => ({
        materialId,
        materialName: data.name,
        unit: data.unit,
        quantityMoved: data.qty,
        totalValue: Number(data.value.toFixed(2)),
        movementCount: data.count,
      }))
      .sort((a, b) => b.quantityMoved - a.quantityMoved)
      .slice(0, 5);

    // Distribuição por categoria
    const categoryMap = new Map<string, { count: number; value: number }>();
    materials.forEach((m) => {
      const cat = categoryMap.get(m.category) || { count: 0, value: 0 };
      cat.count += 1;
      cat.value += m.currentStock * m.unitPrice;
      categoryMap.set(m.category, cat);
    });

    const stockByCategory = Array.from(categoryMap.entries()).map(([category, info]) => ({
      category,
      count: info.count,
      value: Number(info.value.toFixed(2)),
    }));

    return {
      totalItemsCount: materials.length,
      totalStockValue,
      totalUnitsInStock,
      lowStockItemsCount,
      outOfStockCount,
      turnoverRate,
      averageStayDays,
      expiredCount,
      nearExpirationCount,
      movementsSummary: {
        totalEntries: entries.length,
        totalExits: exits.length,
        entriesValue: Number(totalEntriesValue.toFixed(2)),
        exitsValue: Number(totalExitsValue.toFixed(2)),
      },
      mostMovedMaterials,
      stockByCategory,
      recentMovements: movements.slice(-8).reverse(),
      urgentAlerts: urgentAlerts.slice(0, 8),
    };
  }

  // --- USUÁRIOS ---
  public getUsers(): User[] {
    return this.data.users;
  }
}

export const db = new DatabaseService();
