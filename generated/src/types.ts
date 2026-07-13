export type UserRole = 'ADMIN' | 'GERENTE' | 'ATENDENTE' | 'MECANICO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: Address;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plate: string; // Placa
  brand: string; // Marca
  model: string; // Modelo
  year: number; // Ano
  color: string; // Cor
  chassis?: string; // Chassi
  renavam?: string; // Renavam
  mileage: number; // Quilometragem
  observations?: string; // Observações
  clientId: string; // Owner ID
  createdAt: string;
}

export interface OSPart {
  partId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OSLabor {
  description: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export type OSStatus = 
  | 'ORCAMENTO' 
  | 'APROVADO' 
  | 'EM_ANDAMENTO' 
  | 'AGUARDANDO_PECA' 
  | 'PRONTO' 
  | 'CONCLUIDO' 
  | 'CANCELADO';

export interface ServiceOrder {
  id: string;
  osNumber: number; // Sequential e.g. 1001, 1002
  clientId: string;
  clientName: string; // Snapshot for history
  vehicleId: string;
  vehiclePlate: string; // Snapshot
  vehicleModel: string; // Snapshot
  description: string; // Descrição do problema / serviço solicitado
  mechanicId: string; // Mecânico responsável
  mechanicName: string;
  status: OSStatus;
  parts: OSPart[];
  labor: OSLabor[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod?: 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO' | 'BOLETO' | 'FATURADO';
  paymentStatus: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  signature?: string; // Base64 signature image
  observations?: string; // Observações técnicas
  photos: string[]; // Base64 list or URLs
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface InventoryItem {
  id: string;
  code: string; // Código de referência
  name: string; // Nome da peça
  description?: string;
  supplier: string; // Fornecedor
  costPrice: number; // Preço de compra
  salePrice: number; // Preço de venda
  currentStock: number;
  minStock: number; // Estoque mínimo para alerta
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  category: 
    | 'SERVICO' 
    | 'VENDA_PECA' 
    | 'SALARIO' 
    | 'ALUGUEL' 
    | 'FERRAMENTAS' 
    | 'IMPOSTOS' 
    | 'UTILIDADES' // Água, Luz, Net, etc.
    | 'FORNECEDOR' 
    | 'OUTROS';
  description: string;
  value: number;
  date: string;
  dueDate: string; // Data de vencimento
  paymentDate?: string; // Data de pagamento
  status: 'PAGO' | 'PENDENTE' | 'VENCIDO';
  osId?: string; // Link to OS if applicable
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'STOCK_LOW' | 'OVERDUE_BILL' | 'DELAYED_OS' | 'REVISION_ALERT' | 'OIL_CHANGE';
  title: string;
  message: string;
  read: boolean;
  date: string;
  link?: string;
}

export interface DashboardStats {
  dailyRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  openOSCount: number;
  completedOSCount: number;
  vehiclesInMaintenance: number;
  lowStockCount: number;
  revenueChartData: { name: string; receita: number; despesa: number; lucro: number }[];
  osStatusChartData: { name: string; value: number; color: string }[];
}
