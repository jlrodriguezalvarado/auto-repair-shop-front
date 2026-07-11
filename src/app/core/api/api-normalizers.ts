import { DashboardSummary, WorkOrder } from './models';

export function normalizeWorkOrder(order: any): WorkOrder {
  const totals = order.totals || {};
  return {
    ...order,
    servicesTotal: Number(order.servicesTotal ?? totals.servicesTotal ?? 0),
    itemsTotal: Number(order.itemsTotal ?? totals.itemsTotal ?? 0),
    grandTotal: Number(order.grandTotal ?? totals.grandTotal ?? 0)
  };
}

export function normalizeWorkOrderList(orders: any[]): WorkOrder[] {
  return orders.map(normalizeWorkOrder);
}

export function normalizeDashboardSummary(data: any): DashboardSummary {
  const debtors = (data.customersWithDebt || []).map((item: any) => ({
    id: item.customerId || 0,
    name: `${item.customerFirstName || ''} ${item.customerLastName || ''}`.trim() || 'Cliente',
    debt: Number(item.pendingAmount || 0)
  }));
  const topServices = (data.topServices || []).map((item: any) => ({
    name: item.name || 'Servicio',
    count: Number(item.count || 0)
  }));
  const recentPayments = (data.recentPayments || []).map((item: any) => ({
    id: item.id,
    amount: Number(item.amount || 0),
    date: item.paymentDate || '',
    customerName: `${item.customerFirstName || ''} ${item.customerLastName || ''}`.trim()
      || item.receiptCode
      || 'Cliente'
  }));
  return {
    carsServiced: Number(data.vehiclesServedCount || 0),
    pendingReceiptsCount: Number(data.pendingReceiptsCount || 0),
    totalToCollect: Number(data.pendingReceiptsTotal || 0),
    incomeReceived: Number(data.receivedIncomeTotal || 0),
    workOrdersCount: Number(data.workOrdersCount || 0),
    debtorCustomersCount: debtors.length,
    ordersByStatus: data.workOrdersByStatus || [],
    receiptsByStatus: data.receiptsByStatus || [],
    topServices,
    recentPayments,
    debtors
  };
}

export function mapDashboardPeriod(period?: string): string | undefined {
  if (!period) return undefined;
  if (period === 'week') return 'current_week';
  if (period === 'month') return 'current_month';
  return period;
}
