import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // --- HEALTH CHECK ---
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      system: 'Sistema de Gestão de Estoque e Almoxarifado',
      leadDeveloper: 'Laura Taveira',
      timestamp: new Date().toISOString(),
    });
  });

  // --- AUTHENTICATION (MVP) ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email } = req.body;
    const users = db.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || users[0];
    res.json({ success: true, user });
  });

  app.get('/api/auth/users', (req: Request, res: Response) => {
    res.json(db.getUsers());
  });

  // --- MATERIAIS ---
  app.get('/api/materials', (req: Request, res: Response) => {
    const { search, category, status } = req.query;
    const materials = db.getMaterials({
      search: search as string,
      category: category as string,
      status: status as string,
    });
    res.json(materials);
  });

  app.get('/api/materials/:id', (req: Request, res: Response) => {
    const material = db.getMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material não encontrado.' });
    }
    res.json(material);
  });

  app.post('/api/materials', (req: Request, res: Response) => {
    try {
      const { name, category, unit, currentStock, minStock, unitPrice, description, lotNumber, expirationDate, location, code } = req.body;
      if (!name || !category || !unit) {
        return res.status(400).json({ error: 'Nome, categoria e unidade de medida são obrigatórios.' });
      }

      const material = db.createMaterial({
        name,
        code: code || '',
        category,
        unit,
        currentStock: Number(currentStock) || 0,
        minStock: Number(minStock) || 0,
        unitPrice: Number(unitPrice) || 0,
        description: description || '',
        lotNumber,
        expirationDate,
        location,
      });

      res.status(201).json(material);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao cadastrar material.' });
    }
  });

  app.put('/api/materials/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateMaterial(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Material não encontrado.' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao atualizar material.' });
    }
  });

  app.delete('/api/materials/:id', (req: Request, res: Response) => {
    const result = db.deleteMaterial(req.params.id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, message: 'Material removido com sucesso.' });
  });

  // --- SETORES ---
  app.get('/api/sectors', (req: Request, res: Response) => {
    res.json(db.getSectors());
  });

  app.get('/api/sectors/:id', (req: Request, res: Response) => {
    const sector = db.getSectorById(req.params.id);
    if (!sector) {
      return res.status(404).json({ error: 'Setor não encontrado.' });
    }
    res.json(sector);
  });

  app.post('/api/sectors', (req: Request, res: Response) => {
    try {
      const { name, code, costCenter, responsible, phone, email, description } = req.body;
      if (!name || !costCenter || !responsible) {
        return res.status(400).json({ error: 'Nome do setor, Centro de Custo e Responsável são obrigatórios.' });
      }

      const sector = db.createSector({
        name,
        code: code || '',
        costCenter,
        responsible,
        phone,
        email,
        description,
      });

      res.status(201).json(sector);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao cadastrar setor.' });
    }
  });

  app.put('/api/sectors/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateSector(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Setor não encontrado.' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao atualizar setor.' });
    }
  });

  app.delete('/api/sectors/:id', (req: Request, res: Response) => {
    const result = db.deleteSector(req.params.id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, message: 'Setor removido com sucesso.' });
  });

  // --- MOVIMENTAÇÕES ---
  app.get('/api/movements', (req: Request, res: Response) => {
    const { dateFrom, dateTo, materialId, type, sectorId } = req.query;
    const movements = db.getMovements({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      materialId: materialId as string,
      type: type as string,
      sectorId: sectorId as string,
    });
    res.json(movements);
  });

  app.post('/api/movements', (req: Request, res: Response) => {
    try {
      const {
        type,
        materialId,
        quantity,
        unitPrice,
        date,
        supplier,
        lotNumber,
        expirationDate,
        invoiceNumber,
        sectorId,
        reason,
        requesterName,
        requisitionId,
        notes,
        registeredBy,
      } = req.body;

      if (!type || !materialId || !quantity) {
        return res.status(400).json({ error: 'Tipo de movimentação, material e quantidade são obrigatórios.' });
      }

      if (type === 'SAIDA' && !sectorId && !reason) {
        return res.status(400).json({ error: 'Para saídas de material, informe o setor solicitante ou motivo.' });
      }

      const result = db.registerMovement({
        type,
        materialId,
        quantity: Number(quantity),
        unitPrice: unitPrice !== undefined ? Number(unitPrice) : undefined,
        date,
        supplier,
        lotNumber,
        expirationDate,
        invoiceNumber,
        sectorId,
        reason,
        requesterName,
        requisitionId,
        notes,
        registeredBy,
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json(result.movement);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao registrar movimentação.' });
    }
  });

  // --- REQUISIÇÕES ---
  app.get('/api/requisitions', (req: Request, res: Response) => {
    const { status, sectorId, search } = req.query;
    const requisitions = db.getRequisitions({
      status: status as string,
      sectorId: sectorId as string,
      search: search as string,
    });
    res.json(requisitions);
  });

  app.get('/api/requisitions/:id', (req: Request, res: Response) => {
    const reqItem = db.getRequisitionById(req.params.id);
    if (!reqItem) {
      return res.status(404).json({ error: 'Requisição não encontrada.' });
    }
    res.json(reqItem);
  });

  app.post('/api/requisitions', (req: Request, res: Response) => {
    try {
      const { sectorId, requesterName, priority, notes, items } = req.body;
      if (!sectorId || !requesterName || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Setor, solicitante e lista de itens são obrigatórios.' });
      }

      const result = db.createRequisition({
        sectorId,
        requesterName,
        priority,
        notes,
        items,
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json(result.requisition);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao gerar requisição.' });
    }
  });

  app.put('/api/requisitions/:id/status', (req: Request, res: Response) => {
    try {
      const { status, user, autoCreateMovements } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório.' });
      }

      const result = db.updateRequisitionStatus(
        req.params.id,
        status,
        user || 'Laura Taveira',
        autoCreateMovements !== false
      );

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.json(result.requisition);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao atualizar status da requisição.' });
    }
  });

  app.delete('/api/requisitions/:id', (req: Request, res: Response) => {
    const success = db.deleteRequisition(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Requisição não encontrada.' });
    }
    res.json({ success: true, message: 'Requisição excluída com sucesso.' });
  });

  // --- DASHBOARD ---
  app.get('/api/dashboard', (req: Request, res: Response) => {
    try {
      const stats = db.getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao carregar dados do dashboard.' });
    }
  });

  // --- SEED RESET ---
  app.post('/api/seed/reset', (req: Request, res: Response) => {
    try {
      const data = db.resetSeed();
      res.json({ success: true, message: 'Dados de demonstração restaurados com sucesso.', counts: {
        materials: data.materials.length,
        sectors: data.sectors.length,
        movements: data.movements.length,
        requisitions: data.requisitions.length,
      }});
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao restaurar dados.' });
    }
  });

  // --- VITE MIDDLEWARE (Dev) ou STATIC (Prod) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sistema de Gestão de Estoque] Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha crítica ao iniciar servidor:', err);
  process.exit(1);
});
