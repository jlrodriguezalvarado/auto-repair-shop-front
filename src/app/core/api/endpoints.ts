export const ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    refresh: '/auth/refresh/',
    me: '/auth/me/'
  },
  company: {
    detail: '/company/',
    update: '/company/',
  },
  customers: {
    list: '/customers/',
    detail: (id: number | string) => `/customers/${id}/`,
  },
  vehicles: {
    list: '/vehicles/',
    detail: (id: number | string) => `/vehicles/${id}/`,
  },
  serviceCatalog: {
    list: '/service-catalog/',
    detail: (id: number | string) => `/service-catalog/${id}/`,
  },
  workOrders: {
    list: '/work-orders/',
    detail: (id: number | string) => `/work-orders/${id}/`,
    services: (id: number | string) => `/work-orders/${id}/services/`,
    items: (id: number | string) => `/work-orders/${id}/items/`,
    changeStatus: (id: number | string) => `/work-orders/${id}/change-status/`,
    assignMechanic: (id: number | string) => `/work-orders/${id}/assign-mechanic/`,
  },
  estimates: {
    list: '/estimates/',
    detail: (id: number | string) => `/estimates/${id}/`,
    services: (id: number | string) => `/estimates/${id}/services/`,
    items: (id: number | string) => `/estimates/${id}/items/`,
    approve: (id: number | string) => `/estimates/${id}/approve/`,
    reject: (id: number | string) => `/estimates/${id}/reject/`,
    createWorkOrder: (id: number | string) => `/estimates/${id}/create-work-order/`,
    pdf: (id: number | string) => `/estimates/${id}/pdf/`,
    persistPdf: (id: number | string) => `/estimates/${id}/persist-pdf/`,
  },
  receipts: {
    list: '/receipts/',
    detail: (id: number | string) => `/receipts/${id}/`,
    services: (id: number | string) => `/receipts/${id}/services/`,
    items: (id: number | string) => `/receipts/${id}/items/`,
    payments: (id: number | string) => `/receipts/${id}/payments/`,
    pdf: (id: number | string) => `/receipts/${id}/pdf/`,
    persistPdf: (id: number | string) => `/receipts/${id}/persist-pdf/`,
  },
  dashboard: {
    summary: '/dashboard/summary/',
  },
  users: {
    list: '/users/',
    detail: (id: number | string) => `/users/${id}/`,
  }
};
