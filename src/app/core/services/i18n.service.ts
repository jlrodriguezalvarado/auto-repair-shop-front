import { Injectable, signal, computed } from '@angular/core';

export type Language = 'es' | 'en';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

const ES_TRANSLATIONS: TranslationDictionary = {
  nav: {
    dashboard: 'Tablero',
    company: 'Empresa',
    customers: 'Clientes',
    vehicles: 'Vehículos',
    serviceCatalog: 'Catálogo de Servicios',
    workOrders: 'Órdenes de Trabajo',
    estimates: 'Presupuestos',
    receipts: 'Recibos',
    users: 'Usuarios',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión'
  },
  status: {
    received: 'Recibido',
    under_review: 'En revisión',
    estimated: 'Presupuestado',
    approved: 'Aprobado',
    in_progress: 'En proceso',
    completed: 'Finalizado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    draft: 'Borrador',
    sent: 'Enviado',
    expired: 'Vencido',
    rejected: 'Rechazado',
    unpaid: 'Por pagar',
    partial: 'Pagando',
    paid: 'Pagado',
    overdue: 'Vencido'
  },
  actions: {
    save: 'Guardar',
    cancel: 'Cancelar',
    create: 'Crear',
    edit: 'Editar',
    delete: 'Eliminar',
    search: 'Buscar',
    filter: 'Filtrar',
    approve: 'Aprobar',
    reject: 'Rechazar',
    downloadPdf: 'Descargar PDF',
    savePdf: 'Guardar PDF',
    sendWhatsapp: 'Enviar por WhatsApp',
    addPayment: 'Agregar Pago',
    addService: 'Agregar Servicio',
    addItem: 'Agregar Artículo',
    deactivate: 'Desactivar',
    activate: 'Activar',
    assignMechanic: 'Asignar Mecánico',
    changeStatus: 'Cambiar Estado',
    createWorkOrder: 'Crear Orden de Trabajo',
    createReceipt: 'Crear Recibo',
    close: 'Cerrar'
  },
  validation: {
    required: 'Este campo es obligatorio',
    email: 'Debe ser un correo electrónico válido',
    min: 'El valor debe ser mayor o igual a {{min}}',
    positive: 'Debe ser un monto no negativo',
    greaterThanZero: 'Debe ser mayor que cero',
    plate: 'Placa obligatoria',
    clientRequired: 'Cliente obligatorio',
    vehicleRequired: 'Vehículo obligatorio',
    paymentExceedsPending: 'El monto del pago no puede ser mayor al pendiente'
  },
  common: {
    loading: 'Cargando...',
    error: 'Ha ocurrido un error',
    empty: 'No se encontraron registros',
    retry: 'Reintentar',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    discount: 'Descuento',
    paid: 'Pagado',
    pending: 'Pendiente',
    details: 'Detalles',
    code: 'Código',
    date: 'Fecha',
    notes: 'Notas',
    success: 'Operación realizada con éxito'
  },
  dashboard: {
    carsServiced: 'Autos atendidos',
    pendingReceipts: 'Recibos pendientes',
    totalToCollect: 'Monto total por cobrar',
    incomeReceived: 'Ingresos recibidos',
    workOrders: 'Órdenes de trabajo',
    debtorCustomers: 'Clientes con deuda',
    ordersByStatus: 'Órdenes por estado',
    receiptsByStatus: 'Recibos por estado',
    topServices: 'Servicios más realizados',
    recentPayments: 'Pagos recientes',
    debtorsList: 'Clientes con deuda',
    filterToday: 'Hoy',
    filterThisWeek: 'Esta semana',
    filterThisMonth: 'Este mes',
    filterCustom: 'Personalizado'
  }
};

const EN_TRANSLATIONS: TranslationDictionary = {
  nav: {
    dashboard: 'Dashboard',
    company: 'Company',
    customers: 'Customers',
    vehicles: 'Vehicles',
    serviceCatalog: 'Service Catalog',
    workOrders: 'Work Orders',
    estimates: 'Estimates',
    receipts: 'Receipts',
    users: 'Users',
    login: 'Login',
    logout: 'Logout'
  },
  status: {
    received: 'Received',
    under_review: 'Under Review',
    estimated: 'Estimated',
    approved: 'Approved',
    in_progress: 'In Progress',
    completed: 'Completed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    draft: 'Draft',
    sent: 'Sent',
    expired: 'Expired',
    rejected: 'Rejected',
    unpaid: 'Unpaid',
    partial: 'Partial',
    paid: 'Paid',
    overdue: 'Overdue'
  },
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    approve: 'Approve',
    reject: 'Reject',
    downloadPdf: 'Download PDF',
    savePdf: 'Save PDF',
    sendWhatsapp: 'Send via WhatsApp',
    addPayment: 'Add Payment',
    addService: 'Add Service',
    addItem: 'Add Item',
    deactivate: 'Deactivate',
    activate: 'Activate',
    assignMechanic: 'Assign Mechanic',
    changeStatus: 'Change Status',
    createWorkOrder: 'Create Work Order',
    createReceipt: 'Create Receipt',
    close: 'Close'
  },
  validation: {
    required: 'This field is required',
    email: 'Must be a valid email',
    min: 'Value must be greater than or equal to {{min}}',
    positive: 'Must be a non-negative amount',
    greaterThanZero: 'Must be greater than zero',
    plate: 'Plate is required',
    clientRequired: 'Customer is required',
    vehicleRequired: 'Vehicle is required',
    paymentExceedsPending: 'Payment amount cannot exceed the pending amount'
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    empty: 'No records found',
    retry: 'Retry',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    paid: 'Paid',
    pending: 'Pending',
    details: 'Details',
    code: 'Code',
    date: 'Date',
    notes: 'Notes',
    success: 'Operation completed successfully'
  },
  dashboard: {
    carsServiced: 'Cars serviced',
    pendingReceipts: 'Pending receipts',
    totalToCollect: 'Total amount to collect',
    incomeReceived: 'Income received',
    workOrders: 'Work orders',
    debtorCustomers: 'Customers with debt',
    ordersByStatus: 'Orders by status',
    receiptsByStatus: 'Receipts by status',
    topServices: 'Most performed services',
    recentPayments: 'Recent payments',
    debtorsList: 'Debtor customers',
    filterToday: 'Today',
    filterThisWeek: 'This week',
    filterThisMonth: 'This month',
    filterCustom: 'Custom range'
  }
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLang = signal<Language>('es');

  readonly language = this.currentLang.asReadonly();

  readonly translations = computed(() => {
    return this.currentLang() === 'es' ? ES_TRANSLATIONS : EN_TRANSLATIONS;
  });

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
  }

  toggleLanguage(): void {
    this.currentLang.update(lang => (lang === 'es' ? 'en' : 'es'));
  }

  translate(path: string, params?: Record<string, string | number>): string {
    const keys = path.split('.');
    let value: any = this.translations();

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path;
      }
    }

    if (typeof value !== 'string') {
      return path;
    }

    let translated = value;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        translated = translated.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramVal));
      });
    }

    return translated;
  }
}
