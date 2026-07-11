export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Administrator' | 'Secretary' | 'Mechanic' | 'Customer';
  isActive: boolean;
}

export interface Company {
  id: number;
  name: string;
  taxId: string;
  address: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: number;
  user?: User;
  firstName: string;
  lastName: string;
  documentId: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  address: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: number;
  customer: number;
  customerName?: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  photo?: string;
  vin?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCatalog {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: number;
  code: string;
  customer: number;
  customerName?: string;
  vehicle: number;
  vehiclePlate?: string;
  assignedMechanic?: number;
  assignedMechanicName?: string;
  status: 'received' | 'under_review' | 'estimated' | 'approved' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  privateNote?: string;
  customerComplaint: string;
  diagnosisNote?: string;
  startedAt?: string;
  completedAt?: string;
  deliveredAt?: string;
  servicesTotal: number;
  itemsTotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  services?: WorkOrderService[];
  items?: WorkOrderItem[];
}

export interface WorkOrderService {
  id: number;
  workOrder: number;
  service: number;
  nameSnapshot: string;
  descriptionSnapshot?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface WorkOrderItem {
  id: number;
  workOrder: number;
  name: string;
  description?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  providedBy: 'client' | 'workshop';
  supplierName?: string;
  purchaseDate?: string;
  notes?: string;
}

export interface Estimate {
  id: number;
  code: string;
  customer: number;
  customerName?: string;
  vehicle: number;
  vehiclePlate?: string;
  workOrder?: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  notes?: string;
  validUntil: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  pdfFile?: string;
  createdAt: string;
  updatedAt: string;
  services?: any[];
  items?: any[];
}

export interface Receipt {
  id: number;
  code: string;
  customer: number;
  customerName?: string;
  vehicle: number;
  vehiclePlate?: string;
  workOrder?: number;
  estimate?: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  pendingAmount: number;
  pdfFile?: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
  services?: any[];
  items?: any[];
  payments?: ReceiptPayment[];
}

export interface ReceiptPayment {
  id: number;
  receipt: number;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile_payment' | 'zelle' | 'other';
  reference?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  carsServiced: number;
  pendingReceiptsCount: number;
  totalToCollect: number;
  incomeReceived: number;
  workOrdersCount: number;
  debtorCustomersCount: number;
  ordersByStatus: { status: string; count: number }[];
  receiptsByStatus: { status: string; count: number }[];
  topServices: { name: string; count: number }[];
  recentPayments: { id: number; amount: number; date: string; customerName: string }[];
  debtors: { id: number; name: string; debt: number }[];
}
