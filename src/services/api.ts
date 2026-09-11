import { Material, Sector, Movement, Requisition, User, DashboardStats } from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Erro ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // Ignora erro de parse
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/auth/users`);
    return handleResponse(res);
  },

  // Materiais
  async getMaterials(filter?: { search?: string; category?: string; status?: string }): Promise<Material[]> {
    const params = new URLSearchParams();
    if (filter?.search) params.set('search', filter.search);
    if (filter?.category) params.set('category', filter.category);
    if (filter?.status) params.set('status', filter.status);

    const res = await fetch(`${BASE_URL}/materials?${params.toString()}`);
    return handleResponse(res);
  },

  async getMaterial(id: string): Promise<Material> {
    const res = await fetch(`${BASE_URL}/materials/${id}`);
    return handleResponse(res);
  },

  async createMaterial(data: Partial<Material>): Promise<Material> {
    const res = await fetch(`${BASE_URL}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
    const res = await fetch(`${BASE_URL}/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteMaterial(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/materials/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Setores
  async getSectors(): Promise<Sector[]> {
    const res = await fetch(`${BASE_URL}/sectors`);
    return handleResponse(res);
  },

  async createSector(data: Partial<Sector>): Promise<Sector> {
    const res = await fetch(`${BASE_URL}/sectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateSector(id: string, data: Partial<Sector>): Promise<Sector> {
    const res = await fetch(`${BASE_URL}/sectors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteSector(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/sectors/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Movimentações
  async getMovements(filter?: {
    dateFrom?: string;
    dateTo?: string;
    materialId?: string;
    type?: string;
    sectorId?: string;
  }): Promise<Movement[]> {
    const params = new URLSearchParams();
    if (filter?.dateFrom) params.set('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params.set('dateTo', filter.dateTo);
    if (filter?.materialId) params.set('materialId', filter.materialId);
    if (filter?.type) params.set('type', filter.type);
    if (filter?.sectorId) params.set('sectorId', filter.sectorId);

    const res = await fetch(`${BASE_URL}/movements?${params.toString()}`);
    return handleResponse(res);
  },

  async registerMovement(data: any): Promise<Movement> {
    const res = await fetch(`${BASE_URL}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Requisições
  async getRequisitions(filter?: { status?: string; sectorId?: string; search?: string }): Promise<Requisition[]> {
    const params = new URLSearchParams();
    if (filter?.status) params.set('status', filter.status);
    if (filter?.sectorId) params.set('sectorId', filter.sectorId);
    if (filter?.search) params.set('search', filter.search);

    const res = await fetch(`${BASE_URL}/requisitions?${params.toString()}`);
    return handleResponse(res);
  },

  async getRequisition(id: string): Promise<Requisition> {
    const res = await fetch(`${BASE_URL}/requisitions/${id}`);
    return handleResponse(res);
  },

  async createRequisition(data: any): Promise<Requisition> {
    const res = await fetch(`${BASE_URL}/requisitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateRequisitionStatus(id: string, status: string, user?: string, autoCreateMovements = true): Promise<Requisition> {
    const res = await fetch(`${BASE_URL}/requisitions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, user, autoCreateMovements }),
    });
    return handleResponse(res);
  },

  async deleteRequisition(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/requisitions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboard(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/dashboard`);
    return handleResponse(res);
  },

  // Seed Reset
  async resetSeed(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/seed/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};

// Named exports for convenient direct imports
export const fetchDashboardStats = () => api.getDashboard();
export const fetchMaterials = (filter?: Parameters<typeof api.getMaterials>[0]) => api.getMaterials(filter);
export const fetchMaterial = (id: string) => api.getMaterial(id);
export const createMaterial = (data: Partial<Material>) => api.createMaterial(data);
export const updateMaterial = (id: string, data: Partial<Material>) => api.updateMaterial(id, data);
export const deleteMaterial = (id: string) => api.deleteMaterial(id);

export const fetchSectors = () => api.getSectors();
export const createSector = (data: Partial<Sector>) => api.createSector(data);
export const updateSector = (id: string, data: Partial<Sector>) => api.updateSector(id, data);
export const deleteSector = (id: string) => api.deleteSector(id);

export const fetchMovements = (filter?: Parameters<typeof api.getMovements>[0]) => api.getMovements(filter);
export const createMovement = (data: any) => api.registerMovement(data);

export const fetchRequisitions = (filter?: Parameters<typeof api.getRequisitions>[0]) => api.getRequisitions(filter);
export const createRequisition = (data: any) => api.createRequisition(data);
export const updateRequisitionStatus = (id: string, status: string, autoCreateMovements?: boolean) =>
  api.updateRequisitionStatus(id, status, 'Laura Taveira', autoCreateMovements);
export const deleteRequisition = (id: string) => api.deleteRequisition(id);
export const resetDatabaseSeed = () => api.resetSeed();
