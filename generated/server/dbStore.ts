import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, Client, Vehicle, ServiceOrder, InventoryItem, 
  FinancialTransaction, Notification, DashboardStats 
} from '../src/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> hashed password
  clients: Client[];
  vehicles: Vehicle[];
  serviceOrders: ServiceOrder[];
  inventory: InventoryItem[];
  financialTransactions: FinancialTransaction[];
  notifications: Notification[];
}

export class DbStore {
  private db: DatabaseSchema = {
    users: [],
    passwords: {},
    clients: [],
    vehicles: [],
    serviceOrders: [],
    inventory: [],
    financialTransactions: [],
    notifications: []
  };

  constructor() {
    this.initDb();
  }

  private initDb() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        this.db = JSON.parse(data);
        return;
      } catch (err) {
        console.error('Erro ao carregar banco de dados. Recriando...', err);
      }
    }

    this.seedDb();
  }

  private save() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.db, null, 2), 'utf-8');
  }

  private seedDb() {
    console.log('Semeando banco de dados com dados iniciais de demonstração...');

    // Users
    const u1Id = 'u-admin';
    const u2Id = 'u-gerente';
    const u3Id = 'u-atendente';
    const u4Id = 'u-mecanico1';
    const u5Id = 'u-mecanico2';

    const users: User[] = [
      { id: u1Id, name: 'Carlos Admin', email: 'admin@oficina.com', role: 'ADMIN', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { id: u2Id, name: 'Beatriz Gerente', email: 'gerente@oficina.com', role: 'GERENTE', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
      { id: u3Id, name: 'Mariana Atendente', email: 'atendente@oficina.com', role: 'ATENDENTE', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
      { id: u4Id, name: 'Pedro Santos', email: 'pedro.mecanico@oficina.com', role: 'MECANICO', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      { id: u5Id, name: 'Julio Silva', email: 'julio.mecanico@oficina.com', role: 'MECANICO', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    ];

    const passwords: Record<string, string> = {
      [u1Id]: bcrypt.hashSync('admin123', 10),
      [u2Id]: bcrypt.hashSync('gerente123', 10),
      [u3Id]: bcrypt.hashSync('atendente123', 10),
      [u4Id]: bcrypt.hashSync('mecanico123', 10),
      [u5Id]: bcrypt.hashSync('mecanico123', 10),
    };

    // Clients
    const clients: Client[] = [
      {
        id: 'c-1',
        name: 'Ana Silva Oliveira',
        cpfCnpj: '123.456.789-00',
        phone: '(11) 98765-4321',
        whatsapp: '5511987654321',
        email: 'ana.silva@gmail.com',
        address: {
          street: 'Avenida Paulista',
          number: '1000',
          complement: 'Apto 42',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100'
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'c-2',
        name: 'Roberto Souza Ramos',
        cpfCnpj: '987.654.321-11',
        phone: '(21) 99888-7766',
        whatsapp: '5521998887766',
        email: 'roberto.souza@yahoo.com.br',
        address: {
          street: 'Rua Barata Ribeiro',
          number: '250',
          neighborhood: 'Copacabana',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '22040-001'
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'c-3',
        name: 'Construções do Vale Ltda',
        cpfCnpj: '12.345.678/0001-99',
        phone: '(31) 3456-7890',
        whatsapp: '5531988112233',
        email: 'contato@construcoesvale.com.br',
        address: {
          street: 'Rua Paraíba',
          number: '550',
          complement: 'Bloco B, Sala 12',
          neighborhood: 'Savassi',
          city: 'Belo Horizonte',
          state: 'MG',
          zipCode: '30130-141'
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Vehicles
    const vehicles: Vehicle[] = [
      {
        id: 'v-1',
        plate: 'BRA2E19',
        brand: 'Volkswagen',
        model: 'Gol 1.0 Flex',
        year: 2020,
        color: 'Branco',
        chassis: '9BWZZZ5UZLT123456',
        renavam: '12345678901',
        mileage: 48500,
        observations: 'Único dono, revisões em dia',
        clientId: 'c-1',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'v-2',
        plate: 'MEC1A23',
        brand: 'Chevrolet',
        model: 'Onix Sedan Premier',
        year: 2022,
        color: 'Prata',
        chassis: '9BGZZZ5UZNT654321',
        renavam: '98765432109',
        mileage: 23100,
        observations: 'Cliente relata barulho na suspensão dianteira esquerda',
        clientId: 'c-2',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'v-3',
        plate: 'ERP4O99',
        brand: 'Toyota',
        model: 'Hilux CD SRV 4x4',
        year: 2019,
        color: 'Preto',
        chassis: '8AJZZZ5UZKT789012',
        renavam: '45612378902',
        mileage: 105200,
        observations: 'Veículo de frota empresarial',
        clientId: 'c-3',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Inventory / Parts
    const inventory: InventoryItem[] = [
      {
        id: 'p-1',
        code: 'P-001',
        name: 'Pastilha de Freio Dianteira - Bosch',
        description: 'Pastilha de freio ceramica de alta performance para Gol, Onix',
        supplier: 'Distribuidora AutoPeças Brasil',
        costPrice: 65.00,
        salePrice: 120.00,
        currentStock: 15,
        minStock: 5,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'p-2',
        code: 'P-002',
        name: 'Filtro de Óleo - Fram PH10906',
        description: 'Filtro de óleo blindado multi-veículos',
        supplier: 'AutoPeças São Paulo',
        costPrice: 15.00,
        salePrice: 35.00,
        currentStock: 25,
        minStock: 10,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'p-3',
        code: 'P-003',
        name: 'Óleo Motor 5W30 Sintético - Motul (1L)',
        description: 'Óleo lubrificante 100% sintético de altíssima qualidade',
        supplier: 'Motul Distribuidora SP',
        costPrice: 38.00,
        salePrice: 75.00,
        currentStock: 4, // ALERT! STOCK LOW
        minStock: 12,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'p-4',
        code: 'P-004',
        name: 'Disco de Freio Dianteiro (Par) - Brembo',
        description: 'Par de discos de freio ventilados de alta durabilidade',
        supplier: 'Distribuidora AutoPeças Brasil',
        costPrice: 180.00,
        salePrice: 320.00,
        currentStock: 8,
        minStock: 3,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'p-5',
        code: 'P-005',
        name: 'Amortecedor Traseiro - Cofap',
        description: 'Amortecedor traseiro Cofap turbo-gás para Gol G7',
        supplier: 'Distribuidora AutoPeças Brasil',
        costPrice: 110.00,
        salePrice: 210.00,
        currentStock: 2, // ALERT! STOCK LOW
        minStock: 4,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Service Orders (OS)
    const serviceOrders: ServiceOrder[] = [
      {
        id: 'os-1',
        osNumber: 1001,
        clientId: 'c-1',
        clientName: 'Ana Silva Oliveira',
        vehicleId: 'v-1',
        vehiclePlate: 'BRA2E19',
        vehicleModel: 'Gol 1.0 Flex',
        description: 'Revisão periódica de 50.000km, troca de óleo e filtros, barulho nas pastilhas',
        mechanicId: 'u-mecanico1',
        mechanicName: 'Pedro Santos',
        status: 'CONCLUIDO',
        parts: [
          { partId: 'p-1', name: 'Pastilha de Freio Dianteira - Bosch', quantity: 1, unitPrice: 120.00, totalPrice: 120.00 },
          { partId: 'p-2', name: 'Filtro de Óleo - Fram PH10906', quantity: 1, unitPrice: 35.00, totalPrice: 35.00 },
          { partId: 'p-3', name: 'Óleo Motor 5W30 Sintético - Motul (1L)', quantity: 4, unitPrice: 75.00, totalPrice: 300.00 }
        ],
        labor: [
          { description: 'Mão de Obra Troca de Óleo e Filtros', price: 60.00, quantity: 1, totalPrice: 60.00 },
          { description: 'Mão de Obra Alinhamento e Balanceamento', price: 120.00, quantity: 1, totalPrice: 120.00 },
          { description: 'Mão de Obra Substituição de Pastilhas Dianteiras', price: 80.00, quantity: 1, totalPrice: 80.00 }
        ],
        subtotal: 715.00,
        discount: 35.00,
        total: 680.00,
        paymentMethod: 'PIX',
        paymentStatus: 'PAGO',
        observations: 'Serviço realizado com sucesso. Pastilhas substituídas e óleo novo inserido.',
        photos: [],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'os-2',
        osNumber: 1002,
        clientId: 'c-2',
        clientName: 'Roberto Souza Ramos',
        vehicleId: 'v-2',
        vehiclePlate: 'MEC1A23',
        vehicleModel: 'Onix Sedan Premier',
        description: 'Barulho agudo na roda dianteira esquerda ao frear. Verificar pinças e discos.',
        mechanicId: 'u-mecanico2',
        mechanicName: 'Julio Silva',
        status: 'EM_ANDAMENTO',
        parts: [
          { partId: 'p-4', name: 'Disco de Freio Dianteiro (Par) - Brembo', quantity: 1, unitPrice: 320.00, totalPrice: 320.00 }
        ],
        labor: [
          { description: 'Substituição do par de discos de freio dianteiro', price: 150.00, quantity: 1, totalPrice: 150.00 }
        ],
        subtotal: 470.00,
        discount: 0,
        total: 470.00,
        paymentStatus: 'PENDENTE',
        observations: 'Pinças higienizadas e lubrificadas. Aguardando finalização do teste de rodagem.',
        photos: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'os-3',
        osNumber: 1003,
        clientId: 'c-3',
        clientName: 'Construções do Vale Ltda',
        vehicleId: 'v-3',
        vehiclePlate: 'ERP4O99',
        vehicleModel: 'Hilux CD SRV 4x4',
        description: 'Orçamento para troca de pastilhas de freio traseiras e revisão preventiva geral.',
        mechanicId: 'u-mecanico1',
        mechanicName: 'Pedro Santos',
        status: 'ORCAMENTO',
        parts: [],
        labor: [
          { description: 'Preventiva geral de suspensão, elétrica e motor', price: 250.00, quantity: 1, totalPrice: 250.00 }
        ],
        subtotal: 250.00,
        discount: 10.00,
        total: 240.00,
        paymentStatus: 'PENDENTE',
        observations: 'Orçamento emitido para aprovação do faturamento corporativo.',
        photos: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Financial Transactions
    const financialTransactions: FinancialTransaction[] = [
      {
        id: 'f-1',
        type: 'RECEITA',
        category: 'SERVICO',
        description: 'Pagamento OS #1001 - Ana Silva Oliveira',
        value: 680.00,
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PAGO',
        osId: 'os-1',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'f-2',
        type: 'DESPESA',
        category: 'UTILIDADES',
        description: 'Conta de Energia Elétrica - Oficina Centro',
        value: 320.00,
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PAGO',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'f-3',
        type: 'DESPESA',
        category: 'FORNECEDOR',
        description: 'Fatura Fornecedor de Peças Brasil - Lote Pastilhas',
        value: 450.00,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // FUTURE
        status: 'PENDENTE',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'f-4',
        type: 'RECEITA',
        category: 'VENDA_PECA',
        description: 'Venda avulsa Aditivo Radiador - Cliente Balcão',
        value: 110.00,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PAGO',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'f-5',
        type: 'DESPESA',
        category: 'ALUGUEL',
        description: 'Aluguel do Galpão Comercial',
        value: 2500.00,
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PAGO',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'f-6',
        type: 'DESPESA',
        category: 'IMPOSTOS',
        description: 'Imposto DAS Simples Nacional',
        value: 180.00,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // OVERDUE
        status: 'VENCIDO',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Notifications
    const notifications: Notification[] = [
      {
        id: 'n-1',
        type: 'STOCK_LOW',
        title: 'Estoque Baixo',
        message: 'O item "Óleo Motor 5W30 Sintético - Motul (1L)" está com 4 unidades, abaixo do mínimo de 12.',
        read: false,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'n-2',
        type: 'STOCK_LOW',
        title: 'Estoque Mínimo Atingido',
        message: 'O item "Amortecedor Traseiro - Cofap" está com 2 unidades, abaixo do mínimo de 4.',
        read: false,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'n-3',
        type: 'OVERDUE_BILL',
        title: 'Conta Vencida',
        message: 'A despesa "Imposto DAS Simples Nacional" no valor de R$ 180,00 está vencida.',
        read: false,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'n-4',
        type: 'REVISION_ALERT',
        title: 'Alerta de Revisão Preventiva',
        message: 'O veículo Toyota Hilux (ERP4O99) completou 105.200km. Agende uma revisão preventiva.',
        read: false,
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ];

    this.db = {
      users,
      passwords,
      clients,
      vehicles,
      serviceOrders,
      inventory,
      financialTransactions,
      notifications
    };

    this.save();
  }

  // Auth Operations
  getUsers() { return this.db.users; }
  getUserById(id: string) { return this.db.users.find(u => u.id === id); }
  getUserByEmail(email: string) { return this.db.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  getPasswordHash(userId: string) { return this.db.passwords[userId]; }
  
  // Clients Operations
  getClients() { return this.db.clients; }
  getClientById(id: string) { return this.db.clients.find(c => c.id === id); }
  createClient(clientData: Omit<Client, 'id' | 'createdAt'>) {
    const newClient: Client = {
      ...clientData,
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.db.clients.push(newClient);
    this.save();
    return newClient;
  }
  updateClient(id: string, clientData: Partial<Client>) {
    const index = this.db.clients.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.db.clients[index] = { ...this.db.clients[index], ...clientData };
    this.save();
    return this.db.clients[index];
  }
  deleteClient(id: string) {
    const index = this.db.clients.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.db.clients.splice(index, 1);
    this.save();
    return true;
  }

  // Vehicles Operations
  getVehicles() { return this.db.vehicles; }
  getVehicleById(id: string) { return this.db.vehicles.find(v => v.id === id); }
  getVehicleByPlate(plate: string) {
    return this.db.vehicles.find(v => v.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
  }
  getVehiclesByClient(clientId: string) {
    return this.db.vehicles.filter(v => v.clientId === clientId);
  }
  createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt'>) {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: 'v-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.db.vehicles.push(newVehicle);
    this.save();
    return newVehicle;
  }
  updateVehicle(id: string, vehicleData: Partial<Vehicle>) {
    const index = this.db.vehicles.findIndex(v => v.id === id);
    if (index === -1) return null;
    this.db.vehicles[index] = { ...this.db.vehicles[index], ...vehicleData };
    this.save();
    return this.db.vehicles[index];
  }
  deleteVehicle(id: string) {
    const index = this.db.vehicles.findIndex(v => v.id === id);
    if (index === -1) return false;
    this.db.vehicles.splice(index, 1);
    this.save();
    return true;
  }

  // Inventory Operations
  getInventory() { return this.db.inventory; }
  getInventoryItemById(id: string) { return this.db.inventory.find(i => i.id === id); }
  createInventoryItem(itemData: Omit<InventoryItem, 'id' | 'createdAt'>) {
    const newItem: InventoryItem = {
      ...itemData,
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.db.inventory.push(newItem);
    this.checkStockLow(newItem);
    this.save();
    return newItem;
  }
  updateInventoryItem(id: string, itemData: Partial<InventoryItem>) {
    const index = this.db.inventory.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.db.inventory[index] = { ...this.db.inventory[index], ...itemData };
    this.checkStockLow(this.db.inventory[index]);
    this.save();
    return this.db.inventory[index];
  }
  deleteInventoryItem(id: string) {
    const index = this.db.inventory.findIndex(i => i.id === id);
    if (index === -1) return false;
    this.db.inventory.splice(index, 1);
    this.save();
    return true;
  }

  private checkStockLow(item: InventoryItem) {
    if (item.currentStock <= item.minStock) {
      const exists = this.db.notifications.some(
        n => n.type === 'STOCK_LOW' && n.message.includes(`"${item.name}"`) && !n.read
      );
      if (!exists) {
        const notif: Notification = {
          id: 'n-' + Math.random().toString(36).substr(2, 9),
          type: 'STOCK_LOW',
          title: 'Estoque Baixo',
          message: `O item "${item.name}" está com ${item.currentStock} unidades, abaixo do mínimo de ${item.minStock}.`,
          read: false,
          date: new Date().toISOString()
        };
        this.db.notifications.unshift(notif);
      }
    }
  }

  // Service Orders Operations
  getServiceOrders() { return this.db.serviceOrders; }
  getServiceOrderById(id: string) { return this.db.serviceOrders.find(o => o.id === id); }
  getServiceOrdersByVehicle(vehicleId: string) {
    return this.db.serviceOrders.filter(o => o.vehicleId === vehicleId);
  }
  getServiceOrdersByClient(clientId: string) {
    return this.db.serviceOrders.filter(o => o.clientId === clientId);
  }

  createServiceOrder(osData: Omit<ServiceOrder, 'id' | 'osNumber' | 'createdAt' | 'updatedAt'>) {
    const lastOS = this.db.serviceOrders.reduce((max, os) => os.osNumber > max ? os.osNumber : max, 1000);
    const newOSNumber = lastOS + 1;
    
    // Deduct stock if status approved/inprogress/completed
    if (['APROVADO', 'EM_ANDAMENTO', 'PRONTO', 'CONCLUIDO'].includes(osData.status)) {
      this.deductStockForOSParts(osData.parts);
    }

    const newOS: ServiceOrder = {
      ...osData,
      id: 'os-' + Math.random().toString(36).substr(2, 9),
      osNumber: newOSNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: osData.status === 'CONCLUIDO' ? new Date().toISOString() : undefined
    };

    this.db.serviceOrders.unshift(newOS);

    // If payment status is PAGO, create a Financial transaction automatically!
    if (newOS.paymentStatus === 'PAGO' && newOS.total > 0) {
      this.createFinancialFromOS(newOS);
    }

    this.save();
    return newOS;
  }

  updateServiceOrder(id: string, osData: Partial<ServiceOrder>) {
    const index = this.db.serviceOrders.findIndex(o => o.id === id);
    if (index === -1) return null;

    const oldOS = this.db.serviceOrders[index];
    const wasCompleted = oldOS.status === 'CONCLUIDO';
    const isNowCompleted = osData.status === 'CONCLUIDO';

    const wasPaid = oldOS.paymentStatus === 'PAGO';
    const isNowPaid = osData.paymentStatus === 'PAGO';

    // Check if parts changed, handle inventory balances
    // For simplicity, if turning to a stock-deducting status from a draft:
    const oldDeducted = ['APROVADO', 'EM_ANDAMENTO', 'PRONTO', 'CONCLUIDO'].includes(oldOS.status);
    const nowDeducting = ['APROVADO', 'EM_ANDAMENTO', 'PRONTO', 'CONCLUIDO'].includes(osData.status || oldOS.status);

    if (!oldDeducted && nowDeducting) {
      // Deduct stock now
      this.deductStockForOSParts(osData.parts || oldOS.parts);
    } else if (oldDeducted && !nowDeducting) {
      // Refund stock
      this.refundStockForOSParts(oldOS.parts);
    } else if (oldDeducted && nowDeducting && osData.parts) {
      // Re-calculate difference: refund old, deduct new
      this.refundStockForOSParts(oldOS.parts);
      this.deductStockForOSParts(osData.parts);
    }

    // Build updated object
    const updatedOS: ServiceOrder = {
      ...oldOS,
      ...osData,
      updatedAt: new Date().toISOString(),
      completedAt: isNowCompleted ? (oldOS.completedAt || new Date().toISOString()) : undefined
    };

    this.db.serviceOrders[index] = updatedOS;

    // Handle financial entry
    if (!wasPaid && isNowPaid && updatedOS.total > 0) {
      this.createFinancialFromOS(updatedOS);
    } else if (wasPaid && !isNowPaid) {
      // Remove linked financial transaction if marked unpaid
      this.db.financialTransactions = this.db.financialTransactions.filter(f => f.osId !== id);
    } else if (wasPaid && isNowPaid && osData.total !== undefined) {
      // Update linked financial transaction amount
      const fIndex = this.db.financialTransactions.findIndex(f => f.osId === id);
      if (fIndex !== -1) {
        this.db.financialTransactions[fIndex].value = updatedOS.total;
      }
    }

    this.save();
    return updatedOS;
  }

  deleteServiceOrder(id: string) {
    const index = this.db.serviceOrders.findIndex(o => o.id === id);
    if (index === -1) return false;

    const oldOS = this.db.serviceOrders[index];
    const oldDeducted = ['APROVADO', 'EM_ANDAMENTO', 'PRONTO', 'CONCLUIDO'].includes(oldOS.status);
    if (oldDeducted) {
      this.refundStockForOSParts(oldOS.parts);
    }

    // Remove financial too
    this.db.financialTransactions = this.db.financialTransactions.filter(f => f.osId !== id);

    this.db.serviceOrders.splice(index, 1);
    this.save();
    return true;
  }

  private deductStockForOSParts(parts: any[]) {
    parts.forEach(p => {
      const item = this.db.inventory.find(inv => inv.id === p.partId);
      if (item) {
        item.currentStock = Math.max(0, item.currentStock - p.quantity);
        this.checkStockLow(item);
      }
    });
  }

  private refundStockForOSParts(parts: any[]) {
    parts.forEach(p => {
      const item = this.db.inventory.find(inv => inv.id === p.partId);
      if (item) {
        item.currentStock = item.currentStock + p.quantity;
      }
    });
  }

  private createFinancialFromOS(os: ServiceOrder) {
    const exists = this.db.financialTransactions.some(f => f.osId === os.id);
    if (exists) return;

    const transaction: FinancialTransaction = {
      id: 'f-' + Math.random().toString(36).substr(2, 9),
      type: 'RECEITA',
      category: 'SERVICO',
      description: `Faturamento OS #${os.osNumber} - ${os.clientName}`,
      value: os.total,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'PAGO',
      osId: os.id,
      createdAt: new Date().toISOString()
    };
    this.db.financialTransactions.unshift(transaction);
  }

  // Financial Operations
  getFinancials() { return this.db.financialTransactions; }
  getFinancialById(id: string) { return this.db.financialTransactions.find(f => f.id === id); }
  createFinancial(transactionData: Omit<FinancialTransaction, 'id' | 'createdAt'>) {
    const newTx: FinancialTransaction = {
      ...transactionData,
      id: 'f-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.db.financialTransactions.unshift(newTx);
    this.save();
    return newTx;
  }
  updateFinancial(id: string, transactionData: Partial<FinancialTransaction>) {
    const index = this.db.financialTransactions.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.db.financialTransactions[index] = { ...this.db.financialTransactions[index], ...transactionData };
    this.save();
    return this.db.financialTransactions[index];
  }
  deleteFinancial(id: string) {
    const index = this.db.financialTransactions.findIndex(f => f.id === id);
    if (index === -1) return false;
    this.db.financialTransactions.splice(index, 1);
    this.save();
    return true;
  }

  // Notifications Operations
  getNotifications() { return this.db.notifications; }
  markNotificationAsRead(id: string) {
    const notif = this.db.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }
  markAllNotificationsAsRead() {
    this.db.notifications.forEach(n => n.read = true);
    this.save();
  }

  // Global Search
  globalSearch(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return { clients: [], vehicles: [], serviceOrders: [], inventory: [] };

    const matchingClients = this.db.clients.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.cpfCnpj.includes(q) || 
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );

    const matchingVehicles = this.db.vehicles.filter(v => 
      v.plate.toLowerCase().includes(q) || 
      v.brand.toLowerCase().includes(q) || 
      v.model.toLowerCase().includes(q)
    );

    const matchingOS = this.db.serviceOrders.filter(o => 
      o.osNumber.toString().includes(q) || 
      o.vehiclePlate.toLowerCase().includes(q) || 
      o.clientName.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q)
    );

    const matchingInventory = this.db.inventory.filter(i => 
      i.code.toLowerCase().includes(q) || 
      i.name.toLowerCase().includes(q) || 
      i.supplier.toLowerCase().includes(q)
    );

    return {
      clients: matchingClients,
      vehicles: matchingVehicles,
      serviceOrders: matchingOS,
      inventory: matchingInventory
    };
  }

  // Dashboard Stats Calculations
  getDashboardStats(): DashboardStats {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    // Daily revenue (receipts paid today)
    const dailyRevenue = this.db.financialTransactions
      .filter(f => f.type === 'RECEITA' && f.status === 'PAGO' && f.paymentDate === todayStr)
      .reduce((sum, f) => sum + f.value, 0);

    // Monthly revenue (receipts paid in current month)
    const monthlyRevenue = this.db.financialTransactions
      .filter(f => f.type === 'RECEITA' && f.status === 'PAGO' && f.paymentDate && new Date(f.paymentDate).getMonth() === curMonth && new Date(f.paymentDate).getFullYear() === curYear)
      .reduce((sum, f) => sum + f.value, 0);

    // Monthly expenses (expenses paid in current month)
    const monthlyExpenses = this.db.financialTransactions
      .filter(f => f.type === 'DESPESA' && f.status === 'PAGO' && f.paymentDate && new Date(f.paymentDate).getMonth() === curMonth && new Date(f.paymentDate).getFullYear() === curYear)
      .reduce((sum, f) => sum + f.value, 0);

    // Monthly profit
    const monthlyProfit = monthlyRevenue - monthlyExpenses;

    // Active OS statuses counts
    const openOSCount = this.db.serviceOrders.filter(o => !['CONCLUIDO', 'CANCELADO'].includes(o.status)).length;
    const completedOSCount = this.db.serviceOrders.filter(o => o.status === 'CONCLUIDO').length;

    // Vehicles in maintenance
    const vehiclesInMaintenance = this.db.serviceOrders.filter(o => ['EM_ANDAMENTO', 'AGUARDANDO_PECA'].includes(o.status)).length;

    // Low stock count
    const lowStockCount = this.db.inventory.filter(i => i.currentStock <= i.minStock).length;

    // Monthly revenue chart (past 6 months)
    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const revenueChartData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      const mRev = this.db.financialTransactions
        .filter(f => f.type === 'RECEITA' && f.status === 'PAGO' && f.paymentDate && new Date(f.paymentDate).getMonth() === m && new Date(f.paymentDate).getFullYear() === y)
        .reduce((sum, f) => sum + f.value, 0);

      const mExp = this.db.financialTransactions
        .filter(f => f.type === 'DESPESA' && f.status === 'PAGO' && f.paymentDate && new Date(f.paymentDate).getMonth() === m && new Date(f.paymentDate).getFullYear() === y)
        .reduce((sum, f) => sum + f.value, 0);

      revenueChartData.push({
        name: `${monthsNames[m]}/${y.toString().slice(-2)}`,
        receita: parseFloat(mRev.toFixed(2)),
        despesa: parseFloat(mExp.toFixed(2)),
        lucro: parseFloat((mRev - mExp).toFixed(2))
      });
    }

    // OS Status Chart Data
    const statusLabels: Record<string, { label: string, color: string }> = {
      'ORCAMENTO': { label: 'Orçamentos', color: '#64748b' },
      'APROVADO': { label: 'Aprovados', color: '#3b82f6' },
      'EM_ANDAMENTO': { label: 'Em Execução', color: '#f59e0b' },
      'AGUARDANDO_PECA': { label: 'Aguard. Peça', color: '#ec4899' },
      'PRONTO': { label: 'Prontos', color: '#10b981' },
      'CONCLUIDO': { label: 'Entregues', color: '#10b981' },
      'CANCELADO': { label: 'Cancelados', color: '#ef4444' }
    };

    const osStatusCounts: Record<string, number> = {};
    this.db.serviceOrders.forEach(o => {
      osStatusCounts[o.status] = (osStatusCounts[o.status] || 0) + 1;
    });

    const osStatusChartData = Object.entries(statusLabels).map(([key, config]) => ({
      name: config.label,
      value: osStatusCounts[key] || 0,
      color: config.color
    })).filter(item => item.value > 0);

    return {
      dailyRevenue: parseFloat(dailyRevenue.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      monthlyExpenses: parseFloat(monthlyExpenses.toFixed(2)),
      monthlyProfit: parseFloat(monthlyProfit.toFixed(2)),
      openOSCount,
      completedOSCount,
      vehiclesInMaintenance,
      lowStockCount,
      revenueChartData,
      osStatusChartData
    };
  }
}

export const dbStore = new DbStore();
