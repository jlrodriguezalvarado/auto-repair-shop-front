import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { keysToSnake, keysToCamel } from './case-mapper';
import { User, Company, CustomerProfile, Vehicle, ServiceCatalog, WorkOrder, Estimate, Receipt } from './models';

const MOCK_USERS: User[] = [
  { id: 0, username: 'superadmin', email: 'superadmin@saas.com', role: 'SUPER_ADMIN', isActive: true, company: null },
  { id: 1, username: 'admin', email: 'admin@taller.com', role: 'ADMIN', isActive: true, company: { id: 1, name: 'Taller Mecánico El Chasis Feliz, C.A.' } },
  { id: 2, username: 'sec', email: 'secretary@taller.com', role: 'SECRETARY', isActive: true, company: { id: 1, name: 'Taller Mecánico El Chasis Feliz, C.A.' } },
  { id: 3, username: 'mech', email: 'mech@taller.com', role: 'MECHANIC', isActive: true, company: { id: 1, name: 'Taller Mecánico El Chasis Feliz, C.A.' } },
  { id: 4, username: 'cust', email: 'customer@taller.com', role: 'CUSTOMER', isActive: true, company: { id: 1, name: 'Taller Mecánico El Chasis Feliz, C.A.' } },
];

let mockCompanies: Company[] = [
  {
    id: 1,
    name: 'Taller Mecánico El Chasis Feliz, C.A.',
    taxId: 'J-12345678-9',
    address: 'Calle Principal del Motor, Local 4, Caracas, Venezuela',
    phone: '+582125551234',
    secondaryPhone: '+584125551234',
    email: 'contacto@elchasisfeliz.com',
    logo: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z'
  }
];

let mockCompany: Company = { ...mockCompanies[0] };

let mockCustomers: CustomerProfile[] = [
  { id: 1, firstName: 'Juan', lastName: 'Pérez', documentId: 'V-12345678', phone: '+584141234567', email: 'juan.perez@gmail.com', address: 'Las Mercedes, Caracas', isActive: true, createdAt: '2026-01-02T10:00:00Z', updatedAt: '2026-01-02T10:00:00Z', notes: 'Cliente frecuente, prefiere repuestos originales.' },
  { id: 2, firstName: 'María', lastName: 'Gómez', documentId: 'V-87654321', phone: '+584129876543', email: 'maria.gomez@yahoo.com', address: 'Chacao, Caracas', isActive: true, createdAt: '2026-01-03T11:00:00Z', updatedAt: '2026-01-03T11:00:00Z' },
  { id: 3, firstName: 'Pedro', lastName: 'Rodríguez', documentId: 'V-11223344', phone: '+584161112233', email: 'pedro.rod@hotmail.com', address: 'El Hatillo, Miranda', isActive: false, createdAt: '2026-01-04T12:00:00Z', updatedAt: '2026-01-04T12:00:00Z' }
];

let mockVehicles: Vehicle[] = [
  { id: 1, customer: 1, plate: 'AB123CD', brand: 'Toyota', model: 'Corolla', year: 2018, color: 'Gris Plata', vin: '1234567890ABCDEFG', isActive: true, createdAt: '2026-01-02T10:30:00Z', updatedAt: '2026-01-02T10:30:00Z' },
  { id: 2, customer: 1, plate: 'XY890ZZ', brand: 'Ford', model: 'Explorer', year: 2015, color: 'Negro', isActive: true, createdAt: '2026-01-02T11:00:00Z', updatedAt: '2026-01-02T11:00:00Z' },
  { id: 3, customer: 2, plate: 'EF456GH', brand: 'Chevrolet', model: 'Aveo', year: 2012, color: 'Azul', isActive: true, createdAt: '2026-01-03T11:30:00Z', updatedAt: '2026-01-03T11:30:00Z' }
];

let mockServices: ServiceCatalog[] = [
  { id: 1, name: 'Cambio de Aceite y Filtro', description: 'Cambio de aceite de motor multigrado y filtro estándar.', basePrice: 45.00, estimatedDurationMinutes: 30, isActive: true, createdAt: '2026-01-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z' },
  { id: 2, name: 'Alineación y Balanceo', description: 'Alineación de tren delantero y balanceo de 4 ruedas.', basePrice: 30.00, estimatedDurationMinutes: 60, isActive: true, createdAt: '2026-01-01T09:30:00Z', updatedAt: '2026-01-01T09:30:00Z' },
  { id: 3, name: 'Revisión de Frenos', description: 'Inspección completa de pastillas, discos y fluido.', basePrice: 20.00, estimatedDurationMinutes: 40, isActive: true, createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z' },
  { id: 4, name: 'Entonación de Motor', description: 'Limpieza de inyectores, cambio de bujías y filtro de gasolina.', basePrice: 120.00, estimatedDurationMinutes: 120, isActive: true, createdAt: '2026-01-01T10:30:00Z', updatedAt: '2026-01-01T10:30:00Z' }
];

let mockWorkOrders: WorkOrder[] = [
  {
    id: 1,
    code: 'OT-0001',
    customer: 1,
    vehicle: 1,
    assignedMechanic: 3,
    status: 'in_progress',
    customerComplaint: 'Ruido metálico en el tren delantero al cruzar.',
    privateNote: 'Posible desgaste en bujes de meseta.',
    servicesTotal: 50,
    itemsTotal: 120,
    grandTotal: 170,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
    services: [
      { id: 1, workOrder: 1, service: 2, nameSnapshot: 'Alineación y Balanceo', quantity: 1, unitPrice: 30, totalPrice: 30 },
      { id: 2, workOrder: 1, service: 3, nameSnapshot: 'Revisión de Frenos', quantity: 1, unitPrice: 20, totalPrice: 20 }
    ],
    items: [
      { id: 1, workOrder: 1, name: 'Bujes de Meseta', quantity: 2, unitCost: 35, totalCost: 70, providedBy: 'workshop', supplierName: 'Repuestos El Pana', purchaseDate: '2026-01-05', notes: 'Garantía 6 meses.' },
      { id: 2, workOrder: 1, name: 'Pastillas de Freno delanteras', quantity: 1, unitCost: 50, totalCost: 50, providedBy: 'client', notes: 'Traídas por el cliente.' }
    ]
  },
  {
    id: 2,
    code: 'OT-0002',
    customer: 2,
    vehicle: 3,
    status: 'received',
    customerComplaint: 'Mantenimiento preventivo general.',
    servicesTotal: 45,
    itemsTotal: 0,
    grandTotal: 45,
    createdAt: '2026-01-06T14:00:00Z',
    updatedAt: '2026-01-06T14:00:00Z',
    services: [
      { id: 3, workOrder: 2, service: 1, nameSnapshot: 'Cambio de Aceite y Filtro', quantity: 1, unitPrice: 45, totalPrice: 45 }
    ],
    items: []
  }
];

let mockEstimates: Estimate[] = [
  {
    id: 1,
    code: 'PRE-0001',
    customer: 1,
    vehicle: 1,
    workOrder: 1,
    status: 'draft',
    notes: 'Presupuesto inicial para reparación de tren delantero.',
    validUntil: '2026-01-20',
    subtotal: 170,
    discountAmount: 10,
    taxAmount: 25.6,
    total: 185.6,
    createdAt: '2026-01-05T11:00:00Z',
    updatedAt: '2026-01-05T11:00:00Z',
    services: [
      { name: 'Alineación y Balanceo', quantity: 1, price: 30, total: 30 },
      { name: 'Revisión de Frenos', quantity: 1, price: 20, total: 20 }
    ],
    items: [
      { name: 'Bujes de Meseta', quantity: 2, price: 35, total: 70 },
      { name: 'Pastillas de Freno', quantity: 1, price: 50, total: 50 }
    ]
  }
];

let mockReceipts: Receipt[] = [
  {
    id: 1,
    code: 'REC-0001',
    customer: 1,
    vehicle: 1,
    workOrder: 1,
    status: 'partial',
    subtotal: 170,
    discountAmount: 10,
    taxAmount: 25.6,
    total: 185.6,
    paidAmount: 85.6,
    pendingAmount: 100.0,
    issuedAt: '2026-01-05T12:00:00Z',
    createdAt: '2026-01-05T12:00:00Z',
    updatedAt: '2026-01-05T12:30:00Z',
    services: [
      { name: 'Alineación y Balanceo', quantity: 1, price: 30, total: 30 },
      { name: 'Revisión de Frenos', quantity: 1, price: 20, total: 20 }
    ],
    items: [
      { name: 'Bujes de Meseta', quantity: 2, price: 35, total: 70 },
      { name: 'Pastillas de Freno', quantity: 1, price: 50, total: 50 }
    ],
    payments: [
      { id: 1, receipt: 1, amount: 85.6, paymentMethod: 'cash', paymentDate: '2026-01-05', notes: 'Pago inicial en efectivo', createdAt: '2026-01-05T12:15:00Z', updatedAt: '2026-01-05T12:15:00Z' }
    ]
  }
];

export const mockApiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const url = req.url;
  const method = req.method;

  if (!url.includes('/api/')) {
    return next(req);
  }

  const endpoint = url.split('/api')[1] || '';
  const companyHeader = req.headers.get('X-Company-Id');
  const tenantEndpoints = [
    '/company/',
    '/customers/',
    '/vehicles/',
    '/service-catalog/',
    '/catalog/',
    '/work-orders/',
    '/estimates/',
    '/receipts/',
    '/dashboard/',
    '/users/users/',
  ];
  const isTenantEndpoint = tenantEndpoints.some((p) => endpoint.startsWith(p));
  const isSafeMethod = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
  if (companyHeader && isTenantEndpoint && !isSafeMethod) {
    return new Observable((observer) =>
      observer.error({ status: 403, error: { detail: 'Read-only company view' } })
    );
  }

  const paginate = (array: any[]) => {
    return {
      count: array.length,
      next: null,
      previous: null,
      results: array
    };
  };

  let responseBody: any = null;

  if (endpoint.startsWith('/users/token/') && !endpoint.includes('refresh')) {
    const body = req.body as any;
    const user = MOCK_USERS.find(u => u.username === body.username || u.email === body.username);
    if (user && body.password) {
      responseBody = {
        access: 'mock-access-token-jwt',
        refresh: 'mock-refresh-token-jwt',
        user: user
      };
    } else {
      return new Observable(observer => observer.error({ status: 401, error: { detail: 'Credenciales inválidas' } }));
    }
  } else if (endpoint.startsWith('/users/token/refresh/')) {
    responseBody = { access: 'mock-new-access-token-jwt' };
  } else if (endpoint.startsWith('/users/users/me/')) {
    responseBody = MOCK_USERS[0];
  }

  else if (endpoint.startsWith('/dashboard/summary/')) {
    responseBody = {
      cars_serviced: mockVehicles.length,
      pending_receipts_count: mockReceipts.filter(r => r.status === 'unpaid' || r.status === 'partial').length,
      total_to_collect: mockReceipts.reduce((sum, r) => sum + r.pendingAmount, 0),
      income_received: mockReceipts.reduce((sum, r) => sum + r.paidAmount, 0),
      work_orders_count: mockWorkOrders.length,
      debtor_customers_count: mockReceipts.filter(r => r.pendingAmount > 0).length,
      orders_by_status: [
        { status: 'received', count: mockWorkOrders.filter(o => o.status === 'received').length },
        { status: 'in_progress', count: mockWorkOrders.filter(o => o.status === 'in_progress').length },
        { status: 'completed', count: mockWorkOrders.filter(o => o.status === 'completed').length }
      ],
      receipts_by_status: [
        { status: 'paid', count: mockReceipts.filter(r => r.status === 'paid').length },
        { status: 'partial', count: mockReceipts.filter(r => r.status === 'partial').length },
        { status: 'unpaid', count: mockReceipts.filter(r => r.status === 'unpaid').length }
      ],
      top_services: [
        { name: 'Alineación y Balanceo', count: 12 },
        { name: 'Cambio de Aceite', count: 9 },
        { name: 'Revisión de Frenos', count: 7 }
      ],
      recent_payments: mockReceipts.flatMap(r => (r.payments || []).map(p => ({
        id: p.id,
        amount: p.amount,
        date: p.paymentDate,
        customer_name: mockCustomers.find(c => c.id === r.customer)?.firstName + ' ' + mockCustomers.find(c => c.id === r.customer)?.lastName
      }))),
      debtors: mockReceipts.filter(r => r.pendingAmount > 0).map(r => ({
        id: r.customer,
        name: (mockCustomers.find(c => c.id === r.customer)?.firstName || '') + ' ' + (mockCustomers.find(c => c.id === r.customer)?.lastName || ''),
        debt: r.pendingAmount
      }))
    };
  }

  else if (endpoint.startsWith('/companies/')) {
    const idMatch = endpoint.match(/\/companies\/(\d+)\//);
    if (idMatch) {
      const id = parseInt(idMatch[1], 10);
      const index = mockCompanies.findIndex(c => c.id === id);
      if (method === 'PUT' || method === 'PATCH') {
        const body = req.body as any;
        mockCompanies[index] = { ...mockCompanies[index], ...body, updatedAt: new Date().toISOString() };
        if (mockCompany.id === id) {
          mockCompany = { ...mockCompanies[index] };
        }
        responseBody = mockCompanies[index];
      } else if (method === 'DELETE') {
        mockCompanies = mockCompanies.filter(c => c.id !== id);
        responseBody = { success: true };
      } else {
        responseBody = mockCompanies.find(c => c.id === id);
      }
    } else if (method === 'POST') {
      const body = req.body as any;
      const newCompany: Company = {
        id: mockCompanies.length + 1,
        name: body.name,
        taxId: body.taxId ?? body.tax_id,
        address: body.address,
        phone: body.phone,
        secondaryPhone: body.secondaryPhone ?? body.secondary_phone,
        email: body.email,
        logo: body.logo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockCompanies.push(newCompany);
      const admin = body.adminUser ?? body.admin_user;
      if (admin) {
        MOCK_USERS.push({
          id: MOCK_USERS.length + 1,
          username: admin.username,
          email: admin.email,
          firstName: admin.firstName ?? admin.first_name,
          lastName: admin.lastName ?? admin.last_name,
          role: 'ADMIN',
          isActive: true,
          company: { id: newCompany.id, name: newCompany.name }
        });
      }
      responseBody = newCompany;
    } else {
      let list = [...mockCompanies];
      const search = req.params.get('search');
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(c =>
          c.name.toLowerCase().includes(s) ||
          c.taxId.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s)
        );
      }
      responseBody = paginate(list);
    }
  }

  else if (endpoint.startsWith('/company/')) {
    if (method === 'PUT' || method === 'PATCH') {
      const body = req.body as any;
      mockCompany = { ...mockCompany, ...body, updated_at: new Date().toISOString() };
    }
    responseBody = mockCompany;
  }

  else if (endpoint.startsWith('/customers/')) {
    const idMatch = endpoint.match(/\/customers\/(\d+)\//);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      if (method === 'DELETE') {
        mockCustomers = mockCustomers.filter(c => c.id !== id);
        responseBody = { success: true };
      } else if (method === 'PUT' || method === 'PATCH') {
        const body = req.body as any;
        const index = mockCustomers.findIndex(c => c.id === id);
        mockCustomers[index] = { ...mockCustomers[index], ...body, updated_at: new Date().toISOString() };
        responseBody = mockCustomers[index];
      } else {
        responseBody = mockCustomers.find(c => c.id === id);
      }
    } else {
      if (method === 'POST') {
        const body = req.body as any;
        const newCustomer: CustomerProfile = {
          id: mockCustomers.length + 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...body
        };
        mockCustomers.push(newCustomer);
        responseBody = newCustomer;
      } else {
        const params = req.params;
        let list = [...mockCustomers];
        const search = params.get('search');
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(c =>
            c.firstName.toLowerCase().includes(s) ||
            c.lastName.toLowerCase().includes(s) ||
            c.phone.includes(s) ||
            c.email.toLowerCase().includes(s) ||
            c.documentId.toLowerCase().includes(s)
          );
        }
        const active = params.get('is_active');
        if (active !== null) {
          const isActive = active === 'true';
          list = list.filter(c => c.isActive === isActive);
        }
        responseBody = paginate(list);
      }
    }
  }

  else if (endpoint.startsWith('/vehicles/')) {
    const idMatch = endpoint.match(/\/vehicles\/(\d+)\//);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      if (method === 'DELETE') {
        mockVehicles = mockVehicles.filter(v => v.id !== id);
        responseBody = { success: true };
      } else if (method === 'PUT' || method === 'PATCH') {
        const body = req.body as any;
        const index = mockVehicles.findIndex(v => v.id === id);
        mockVehicles[index] = { ...mockVehicles[index], ...body, updated_at: new Date().toISOString() };
        responseBody = mockVehicles[index];
      } else {
        responseBody = mockVehicles.find(v => v.id === id);
      }
    } else {
      if (method === 'POST') {
        const body = req.body as any;
        const newVehicle: Vehicle = {
          id: mockVehicles.length + 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...body
        };
        mockVehicles.push(newVehicle);
        responseBody = newVehicle;
      } else {
        const params = req.params;
        let list = [...mockVehicles];
        const search = params.get('search');
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(v =>
            v.plate.toLowerCase().includes(s) ||
            v.brand.toLowerCase().includes(s) ||
            v.model.toLowerCase().includes(s)
          );
        }
        const customerId = params.get('customer');
        if (customerId) {
          list = list.filter(v => v.customer === parseInt(customerId));
        }
        responseBody = paginate(list);
      }
    }
  }

  else if (endpoint.startsWith('/service-catalog/')) {
    const idMatch = endpoint.match(/\/service-catalog\/(\d+)\//);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      if (method === 'DELETE') {
        const index = mockServices.findIndex(s => s.id === id);
        if (index !== -1) {
          mockServices[index].isActive = false;
        }
        responseBody = { success: true };
      } else if (method === 'PUT' || method === 'PATCH') {
        const body = req.body as any;
        const index = mockServices.findIndex(s => s.id === id);
        mockServices[index] = { ...mockServices[index], ...body, updated_at: new Date().toISOString() };
        responseBody = mockServices[index];
      } else {
        responseBody = mockServices.find(s => s.id === id);
      }
    } else {
      if (method === 'POST') {
        const body = req.body as any;
        const newService: ServiceCatalog = {
          id: mockServices.length + 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...body
        };
        mockServices.push(newService);
        responseBody = newService;
      } else {
        const params = req.params;
        let list = [...mockServices];
        const search = params.get('search');
        if (search) {
          list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
        }
        const active = params.get('is_active');
        if (active !== null) {
          list = list.filter(s => s.isActive === (active === 'true'));
        }
        responseBody = paginate(list);
      }
    }
  }

  else if (endpoint.startsWith('/work-orders/')) {
    const idMatch = endpoint.match(/\/work-orders\/(\d+)\//);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const index = mockWorkOrders.findIndex(o => o.id === id);

      if (endpoint.includes('/change-status/')) {
        const body = req.body as any;
        mockWorkOrders[index].status = body.status;
        responseBody = mockWorkOrders[index];
      } else if (endpoint.includes('/assign-mechanic/')) {
        const body = req.body as any;
        mockWorkOrders[index].assignedMechanic = body.assigned_mechanic;
        responseBody = mockWorkOrders[index];
      } else if (endpoint.includes('/services/')) {
        const body = req.body as any;
        mockWorkOrders[index].services = body;
        responseBody = mockWorkOrders[index];
      } else if (endpoint.includes('/items/')) {
        const body = req.body as any;
        mockWorkOrders[index].items = body;
        responseBody = mockWorkOrders[index];
      } else {
        if (method === 'DELETE') {
          mockWorkOrders = mockWorkOrders.filter(o => o.id !== id);
          responseBody = { success: true };
        } else if (method === 'PUT' || method === 'PATCH') {
          const body = req.body as any;
          mockWorkOrders[index] = { ...mockWorkOrders[index], ...body, updated_at: new Date().toISOString() };
          responseBody = mockWorkOrders[index];
        } else {
          responseBody = mockWorkOrders.find(o => o.id === id);
        }
      }
    } else {
      if (method === 'POST') {
        const body = req.body as any;
        const newOrder: WorkOrder = {
          id: mockWorkOrders.length + 1,
          code: `OT-000${mockWorkOrders.length + 1}`,
          status: 'received',
          servicesTotal: 0,
          itemsTotal: 0,
          grandTotal: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          services: [],
          items: [],
          ...body
        };
        mockWorkOrders.push(newOrder);
        responseBody = newOrder;
      } else {
        const params = req.params;
        let list = [...mockWorkOrders];
        const status = params.get('status');
        if (status) {
          list = list.filter(o => o.status === status);
        }
        const client = params.get('customer');
        if (client) {
          list = list.filter(o => o.customer === parseInt(client));
        }
        const vehicle = params.get('vehicle');
        if (vehicle) {
          list = list.filter(o => o.vehicle === parseInt(vehicle));
        }
        responseBody = paginate(list);
      }
    }
  }

  else if (endpoint.startsWith('/estimates/')) {
    const idMatch = endpoint.match(/\/estimates\/(\d+)\//);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const index = mockEstimates.findIndex(e => e.id === id);
      if (endpoint.includes('/approve/')) {
        mockEstimates[index].status = 'approved';
        responseBody = mockEstimates[index];
      } else if (endpoint.includes('/reject/')) {
        mockEstimates[index].status = 'rejected';
        responseBody = mockEstimates[index];
      } else if (endpoint.includes('/create-work-order/')) {
        const est = mockEstimates[index];
        const newOrder: WorkOrder = {
          id: mockWorkOrders.length + 1,
          code: `OT-000${mockWorkOrders.length + 1}`,
          customer: est.customer,
          vehicle: est.vehicle,
          status: 'approved',
          customerComplaint: 'Generado desde presupuesto ' + est.code,
          servicesTotal: est.subtotal,
          itemsTotal: 0,
          grandTotal: est.total,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          services: (est.services || []).map((s, idx) => ({
            id: idx + 1,
            workOrder: mockWorkOrders.length + 1,
            service: 1,
            nameSnapshot: s.name,
            quantity: s.quantity,
            unitPrice: s.price,
            totalPrice: s.total
          })),
          items: (est.items || []).map((it, idx) => ({
            id: idx + 1,
            workOrder: mockWorkOrders.length + 1,
            name: it.name,
            quantity: it.quantity,
            unitCost: it.price,
            totalCost: it.total,
            providedBy: 'workshop'
          }))
        };
        mockWorkOrders.push(newOrder);
        responseBody = newOrder;
      } else if (endpoint.includes('/pdf/')) {
        responseBody = { pdf_file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' };
      } else if (endpoint.includes('/persist-pdf/')) {
        mockEstimates[index].pdfFile = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        responseBody = mockEstimates[index];
      } else {
        if (method === 'DELETE') {
          mockEstimates = mockEstimates.filter(e => e.id !== id);
          responseBody = { success: true };
        } else if (method === 'PUT' || method === 'PATCH') {
          const body = req.body as any;
          mockEstimates[index] = { ...mockEstimates[index], ...body, updated_at: new Date().toISOString() };
          responseBody = mockEstimates[index];
        } else {
          responseBody = mockEstimates.find(e => e.id === id);
        }
      }
    } else {
      if (method === 'POST') {
        const body = req.body as any;
        const newEstimate: Estimate = {
          id: mockEstimates.length + 1,
          code: `PRE-000${mockEstimates.length + 1}`,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...body
        };
        mockEstimates.push(newEstimate);
        responseBody = newEstimate;
      } else {
        responseBody = paginate(mockEstimates);
      }
    }
  }

  else if (endpoint.startsWith('/receipts/')) {
    const idMatch = endpoint.match(/\/receipts\/(\d+)\//);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const index = mockReceipts.findIndex(r => r.id === id);
      if (endpoint.includes('/payments/')) {
        const body = req.body as any;
        const payment = {
          id: (mockReceipts[index].payments || []).length + 1,
          receipt: id,
          amount: body.amount,
          payment_method: body.payment_method,
          reference: body.reference,
          payment_date: body.payment_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockReceipts[index].payments = [...(mockReceipts[index].payments || []), payment as any];
        mockReceipts[index].paidAmount += body.amount;
        mockReceipts[index].pendingAmount = Math.max(0, mockReceipts[index].total - mockReceipts[index].paidAmount);
        if (mockReceipts[index].pendingAmount === 0) {
          mockReceipts[index].status = 'paid';
        } else {
          mockReceipts[index].status = 'partial';
        }
        responseBody = payment;
      } else {
        if (method === 'DELETE') {
          mockReceipts = mockReceipts.filter(r => r.id !== id);
          responseBody = { success: true };
        } else if (method === 'PUT' || method === 'PATCH') {
          const body = req.body as any;
          mockReceipts[index] = { ...mockReceipts[index], ...body, updated_at: new Date().toISOString() };
          responseBody = mockReceipts[index];
        } else {
          responseBody = mockReceipts.find(r => r.id === id);
        }
      }
    } else {
      if (method === 'POST') {
        const body = req.body as any;
        const newReceipt: Receipt = {
          id: mockReceipts.length + 1,
          code: `REC-000${mockReceipts.length + 1}`,
          status: 'unpaid',
          paid_amount: 0,
          pending_amount: body.total,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          payments: [],
          ...body
        };
        mockReceipts.push(newReceipt);
        responseBody = newReceipt;
      } else {
        responseBody = paginate(mockReceipts);
      }
    }
  }

  else if (endpoint.startsWith('/users/')) {
    const idMatch = endpoint.match(/\/users\/(\d+)\//);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const index = MOCK_USERS.findIndex(u => u.id === id);
      if (method === 'PUT' || method === 'PATCH') {
        const body = req.body as any;
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...body };
        responseBody = MOCK_USERS[index];
      } else {
        responseBody = MOCK_USERS.find(u => u.id === id);
      }
    } else {
      responseBody = paginate(MOCK_USERS);
    }
  }

  else if (endpoint.startsWith('/notifications/push-subscriptions/vapid-public-key/')) {
    responseBody = { public_key: '' };
  }
  else if (endpoint.startsWith('/notifications/push-subscriptions/unsubscribe/')) {
    responseBody = {};
  }
  else if (endpoint.startsWith('/notifications/push-subscriptions/')) {
    responseBody = method === 'POST'
      ? { id: 1, endpoint: (req.body as any)?.endpoint, is_active: true }
      : [];
  }
  else if (endpoint.startsWith('/notifications/unread-count/')) {
    responseBody = { unread_count: 0 };
  }
  else if (endpoint.startsWith('/notifications/mark-all-read/')) {
    responseBody = { updated_count: 0 };
  }
  else if (endpoint.match(/\/notifications\/\d+\/mark-read\//)) {
    responseBody = {
      id: 1,
      notification_type: 'work_order.status_changed',
      title: 'Mock',
      body: '',
      data: {},
      is_read: true,
      read_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  else if (endpoint.startsWith('/notifications/')) {
    responseBody = paginate([]);
  }

  const snakePayload = keysToSnake(responseBody);
  return of(new HttpResponse({ status: 200, body: snakePayload })).pipe(delay(200));
};
