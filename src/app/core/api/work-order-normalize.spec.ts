import { WorkOrdersRepository } from '../../features/work-orders/work-orders.repository';
import { WorkOrder } from './models';

describe('WorkOrdersRepository.flattenTotals', () => {
  it('flattens nested totals onto the work order model', () => {
    const normalized = WorkOrdersRepository.flattenTotals({
      id: 1,
      code: 'OT-1',
      customer: 1,
      vehicle: 1,
      status: 'received',
      customerComplaint: 'noise',
      servicesTotal: 0,
      itemsTotal: 0,
      grandTotal: 0,
      totals: { servicesTotal: 50, itemsTotal: 70, grandTotal: 120 },
      createdAt: '',
      updatedAt: '',
    } as WorkOrder);
    expect(normalized.servicesTotal).toBe(50);
    expect(normalized.itemsTotal).toBe(70);
    expect(normalized.grandTotal).toBe(120);
  });
});
