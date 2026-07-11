export const ENDPOINTS = {
  auth: {
    login: '/users/token/',
    refresh: '/users/token/refresh/',
    me: '/users/me/'
  },
  company: {
    detail: '/company/',
    update: '/company/',
  },
  customers: {
    list: '/customers/profiles/',
    detail: (id: number | string) => `/customers/profiles/${id}/`,
  },
  vehicles: {
    list: '/vehicles/vehicles/',
    detail: (id: number | string) => `/vehicles/vehicles/${id}/`,
  },
  serviceCatalog: {
    list: '/catalog/services/',
    detail: (id: number | string) => `/catalog/services/${id}/`,
  },
  workOrders: {
    list: '/work-orders/orders/',
    detail: (id: number | string) => `/work-orders/orders/${id}/`,
    orderServices: '/work-orders/order-services/',
    orderServiceDetail: (id: number | string) => `/work-orders/order-services/${id}/`,
    orderItems: '/work-orders/order-items/',
    orderItemDetail: (id: number | string) => `/work-orders/order-items/${id}/`,
    changeStatus: (id: number | string) => `/work-orders/orders/${id}/change_status/`,
    assignMechanic: (id: number | string) => `/work-orders/orders/${id}/assign_mechanic/`,
  },
  estimates: {
    list: '/estimates/estimates/',
    detail: (id: number | string) => `/estimates/estimates/${id}/`,
    estimateServices: '/estimates/estimate-services/',
    estimateServiceDetail: (id: number | string) => `/estimates/estimate-services/${id}/`,
    estimateItems: '/estimates/estimate-items/',
    estimateItemDetail: (id: number | string) => `/estimates/estimate-items/${id}/`,
    approve: (id: number | string) => `/estimates/estimates/${id}/approve/`,
    createWorkOrder: (id: number | string) => `/estimates/estimates/${id}/create_work_order/`,
    pdf: (id: number | string) => `/estimates/estimates/${id}/pdf/`,
    persistPdf: (id: number | string) => `/estimates/estimates/${id}/persist_pdf/`,
  },
  receipts: {
    list: '/receipts/receipts/',
    detail: (id: number | string) => `/receipts/receipts/${id}/`,
    receiptServices: '/receipts/receipt-services/',
    receiptItems: '/receipts/receipt-items/',
    addPayment: (id: number | string) => `/receipts/receipts/${id}/add_payment/`,
    pdf: (id: number | string) => `/receipts/receipts/${id}/pdf/`,
    persistPdf: (id: number | string) => `/receipts/receipts/${id}/persist_pdf/`,
  },
  dashboard: {
    summary: '/dashboard/summary/',
  },
  users: {
    list: '/users/users/',
    detail: (id: number | string) => `/users/users/${id}/`,
  }
};
