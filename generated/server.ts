import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './server/dbStore';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'oficina-erp-secret-key-2026';

app.use(express.json({ limit: '10mb' }));

// Middleware to extend Express Request type for user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Authentication Middleware
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
    req.user = decoded;
    next();
  });
};

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const user = dbStore.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const passHash = dbStore.getPasswordHash(user.id);
  const isValid = bcrypt.compareSync(password, passHash);
  if (!isValid) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Não autorizado.' });
  const user = dbStore.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json(user);
});


// --- DASHBOARD ENDPOINTS ---
app.get('/api/dashboard', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = dbStore.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar estatísticas do dashboard.' });
  }
});


// --- GLOBAL SEARCH ENDPOINT ---
app.get('/api/search', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const query = req.query.q as string || '';
  res.json(dbStore.globalSearch(query));
});


// --- CLIENTS ENDPOINTS ---
app.get('/api/clients', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json(dbStore.getClients());
});

app.get('/api/clients/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const client = dbStore.getClientById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });
  res.json(client);
});

app.post('/api/clients', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { name, cpfCnpj, phone, whatsapp, email, address } = req.body;
  if (!name || !cpfCnpj || !phone) {
    return res.status(400).json({ error: 'Nome, CPF/CNPJ e Telefone são obrigatórios.' });
  }
  const newClient = dbStore.createClient({ name, cpfCnpj, phone, whatsapp, email, address });
  res.status(201).json(newClient);
});

app.put('/api/clients/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updated = dbStore.updateClient(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Cliente não encontrado.' });
  res.json(updated);
});

app.delete('/api/clients/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  // Check if client has vehicles or service orders
  const vehicles = dbStore.getVehiclesByClient(req.params.id);
  if (vehicles.length > 0) {
    return res.status(400).json({ error: 'Não é possível excluir um cliente que possui veículos cadastrados.' });
  }
  const success = dbStore.deleteClient(req.params.id);
  if (!success) return res.status(404).json({ error: 'Cliente não encontrado.' });
  res.json({ success: true, message: 'Cliente excluído com sucesso.' });
});


// --- VEHICLES ENDPOINTS ---
app.get('/api/vehicles', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json(dbStore.getVehicles());
});

app.get('/api/vehicles/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const vehicle = dbStore.getVehicleById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado.' });
  res.json(vehicle);
});

app.get('/api/vehicles/plate/:plate', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const vehicle = dbStore.getVehicleByPlate(req.params.plate);
  if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado pela placa.' });
  
  // Include owner history and service orders
  const owner = dbStore.getClientById(vehicle.clientId);
  const history = dbStore.getServiceOrdersByVehicle(vehicle.id);
  
  res.json({
    vehicle,
    owner,
    history
  });
});

app.post('/api/vehicles', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { plate, brand, model, year, color, chassis, renavam, mileage, observations, clientId } = req.body;
  if (!plate || !brand || !model || !clientId) {
    return res.status(400).json({ error: 'Placa, Marca, Modelo e Proprietário são obrigatórios.' });
  }
  const newVehicle = dbStore.createVehicle({
    plate: plate.toUpperCase(),
    brand,
    model,
    year: Number(year) || new Date().getFullYear(),
    color,
    chassis,
    renavam,
    mileage: Number(mileage) || 0,
    observations,
    clientId
  });
  res.status(201).json(newVehicle);
});

app.put('/api/vehicles/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updated = dbStore.updateVehicle(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Veículo não encontrado.' });
  res.json(updated);
});

app.delete('/api/vehicles/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  // Check if vehicle has service orders
  const hasOS = dbStore.getServiceOrdersByVehicle(req.params.id).length > 0;
  if (hasOS) {
    return res.status(400).json({ error: 'Não é possível excluir um veículo com histórico de Ordens de Serviço.' });
  }
  const success = dbStore.deleteVehicle(req.params.id);
  if (!success) return res.status(404).json({ error: 'Veículo não encontrado.' });
  res.json({ success: true, message: 'Veículo excluído com sucesso.' });
});

// SIMULATION OF EXTERNAL PLATE LOOKUP (CONSOULTA DE PLACA)
app.get('/api/vehicles/plate-lookup/:plate', (req: Request, res: Response) => {
  const plate = req.params.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  if (plate.length < 7) {
    return res.status(400).json({ error: 'Formato de placa inválido. Deve ter no mínimo 7 caracteres.' });
  }

  // Predefined lists to generate cool plates
  const models = [
    { brand: 'Toyota', model: 'Corolla XEi 2.0', color: 'Prata', year: 2021, renavam: '98471625341', chassis: '9BRFS89A7MT619283' },
    { brand: 'Honda', model: 'Civic LX 2.0', color: 'Cinza', year: 2020, renavam: '84725364810', chassis: '9BRFS89A7LT129482' },
    { brand: 'Fiat', model: 'Toro Freedom 1.8 Flex', color: 'Branco', year: 2022, renavam: '73549281635', chassis: '9BRFS89A7NT940284' },
    { brand: 'Hyundai', model: 'HB20 Evolution 1.0', color: 'Preto', year: 2023, renavam: '18492048294', chassis: '9BRFS89A7OT103947' },
    { brand: 'Jeep', model: 'Compass Longitude 2.0', color: 'Azul Escuro', year: 2019, renavam: '62534182937', chassis: '9BRFS89A7KT829374' }
  ];

  // Pick deterministic index based on plate character codes
  let hash = 0;
  for (let i = 0; i < plate.length; i++) {
    hash += plate.charCodeAt(i);
  }
  const selected = models[hash % models.length];

  // Return realistic simulated API response
  res.json({
    plate,
    brand: selected.brand,
    model: selected.model,
    color: selected.color,
    year: selected.year,
    chassis: selected.chassis,
    renavam: selected.renavam,
    status: 'Regular / Sem Restrições',
    municipio: 'São Paulo - SP'
  });
});


// --- INVENTORY (ESTOQUE) ENDPOINTS ---
app.get('/api/inventory', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json(dbStore.getInventory());
});

app.get('/api/inventory/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const item = dbStore.getInventoryItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item de estoque não encontrado.' });
  res.json(item);
});

app.post('/api/inventory', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { code, name, description, supplier, costPrice, salePrice, currentStock, minStock } = req.body;
  if (!code || !name || costPrice === undefined || salePrice === undefined || currentStock === undefined) {
    return res.status(400).json({ error: 'Código, Nome, Preço de Custo, Preço de Venda e Estoque Atual são obrigatórios.' });
  }
  const newItem = dbStore.createInventoryItem({
    code: code.toUpperCase(),
    name,
    description,
    supplier: supplier || 'Diverso',
    costPrice: Number(costPrice) || 0,
    salePrice: Number(salePrice) || 0,
    currentStock: Number(currentStock) || 0,
    minStock: Number(minStock) || 0
  });
  res.status(201).json(newItem);
});

app.put('/api/inventory/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updated = dbStore.updateInventoryItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Item não encontrado.' });
  res.json(updated);
});

app.delete('/api/inventory/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const success = dbStore.deleteInventoryItem(req.params.id);
  if (!success) return res.status(404).json({ error: 'Item não encontrado.' });
  res.json({ success: true, message: 'Item excluído do estoque com sucesso.' });
});


// --- SERVICE ORDERS (OS) ENDPOINTS ---
app.get('/api/service-orders', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json(dbStore.getServiceOrders());
});

app.get('/api/service-orders/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const os = dbStore.getServiceOrderById(req.params.id);
  if (!os) return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
  res.json(os);
});

app.post('/api/service-orders', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { clientId, clientName, vehicleId, vehiclePlate, vehicleModel, description, mechanicId, mechanicName, status, parts, labor, discount, paymentMethod, paymentStatus, signature, observations, photos } = req.body;
  
  if (!clientId || !vehicleId || !description || !mechanicId) {
    return res.status(400).json({ error: 'Cliente, Veículo, Descrição e Mecânico são obrigatórios.' });
  }

  // Calculate totals safely
  const resolvedParts = parts || [];
  const resolvedLabor = labor || [];
  
  const partsSubtotal = resolvedParts.reduce((sum: number, p: any) => sum + (p.quantity * p.unitPrice), 0);
  const laborSubtotal = resolvedLabor.reduce((sum: number, l: any) => sum + (l.quantity * l.price), 0);
  const subtotal = partsSubtotal + laborSubtotal;
  const disc = Number(discount) || 0;
  const total = Math.max(0, subtotal - disc);

  const newOS = dbStore.createServiceOrder({
    clientId,
    clientName,
    vehicleId,
    vehiclePlate,
    vehicleModel,
    description,
    mechanicId,
    mechanicName,
    status: status || 'ORCAMENTO',
    parts: resolvedParts,
    labor: resolvedLabor,
    subtotal,
    discount: disc,
    total,
    paymentMethod,
    paymentStatus: paymentStatus || 'PENDENTE',
    signature,
    observations,
    photos: photos || []
  });

  res.status(201).json(newOS);
});

app.put('/api/service-orders/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { parts, labor, discount, status, paymentStatus } = req.body;
  const existingOS = dbStore.getServiceOrderById(req.params.id);
  
  if (!existingOS) {
    return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
  }

  // Recalculate if totals changed or if parts/labor updated
  let subtotal = existingOS.subtotal;
  let total = existingOS.total;
  const disc = discount !== undefined ? Number(discount) : existingOS.discount;

  if (parts !== undefined || labor !== undefined) {
    const resolvedParts = parts !== undefined ? parts : existingOS.parts;
    const resolvedLabor = labor !== undefined ? labor : existingOS.labor;

    const partsSubtotal = resolvedParts.reduce((sum: number, p: any) => sum + (p.quantity * p.unitPrice), 0);
    const laborSubtotal = resolvedLabor.reduce((sum: number, l: any) => sum + (l.quantity * l.price), 0);
    subtotal = partsSubtotal + laborSubtotal;
    total = Math.max(0, subtotal - disc);
  } else if (discount !== undefined) {
    total = Math.max(0, subtotal - disc);
  }

  const updatePayload = {
    ...req.body,
    subtotal,
    discount: disc,
    total
  };

  const updated = dbStore.updateServiceOrder(req.params.id, updatePayload);
  res.json(updated);
});

app.delete('/api/service-orders/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const success = dbStore.deleteServiceOrder(req.params.id);
  if (!success) return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
  res.json({ success: true, message: 'Ordem de Serviço excluída com sucesso.' });
});


// --- FINANCIAL ENDPOINTS ---
app.get('/api/financial', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json(dbStore.getFinancials());
});

app.post('/api/financial', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { type, category, description, value, date, dueDate, paymentDate, status, osId } = req.body;
  if (!type || !category || !description || value === undefined || !date || !dueDate) {
    return res.status(400).json({ error: 'Tipo, Categoria, Descrição, Valor, Data e Vencimento são obrigatórios.' });
  }
  const newTx = dbStore.createFinancial({
    type,
    category,
    description,
    value: Number(value) || 0,
    date,
    dueDate,
    paymentDate,
    status: status || 'PENDENTE',
    osId
  });
  res.status(201).json(newTx);
});

app.put('/api/financial/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updated = dbStore.updateFinancial(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Transação não encontrada.' });
  res.json(updated);
});

app.delete('/api/financial/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const success = dbStore.deleteFinancial(req.params.id);
  if (!success) return res.status(404).json({ error: 'Transação não encontrada.' });
  res.json({ success: true, message: 'Lançamento financeiro excluído com sucesso.' });
});


// --- NOTIFICATIONS ENDPOINTS ---
app.get('/api/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json(dbStore.getNotifications());
});

app.put('/api/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const success = dbStore.markNotificationAsRead(req.params.id);
  if (!success) return res.status(404).json({ error: 'Notificação não encontrada.' });
  res.json({ success: true });
});

app.post('/api/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  dbStore.markAllNotificationsAsRead();
  res.json({ success: true });
});


// --- DEV SERVER AND ASSETS SERVING CONFIGURATION ---
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Oficina ERP server successfully running on http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Falha ao iniciar o servidor ERP:', err);
});
