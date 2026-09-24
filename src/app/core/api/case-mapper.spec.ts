import { camelToSnake, keysToCamel, keysToSnake, snakeToCamel } from './case-mapper';

describe('case-mapper', () => {
  it('converts camelCase keys to snake_case', () => {
    expect(camelToSnake('mechanicId')).toBe('mechanic_id');
    expect(keysToSnake({ mechanicId: 3, providedBy: 'customer' })).toEqual({
      mechanic_id: 3,
      provided_by: 'customer',
    });
  });

  it('converts snake_case keys to camelCase', () => {
    expect(snakeToCamel('services_total')).toBe('servicesTotal');
    expect(keysToCamel({ services_total: '10.00', grand_total: '20.00' })).toEqual({
      servicesTotal: '10.00',
      grandTotal: '20.00',
    });
  });

  it('serializes Date values instead of emptying objects', () => {
    const date = new Date('2026-01-15T12:00:00.000Z');
    expect(keysToSnake({ purchaseDate: date })).toEqual({
      purchase_date: '2026-01-15T12:00:00.000Z',
    });
  });

  it('maps nested totals used by work orders', () => {
    const raw = {
      id: 1,
      totals: { services_total: '50.00', items_total: '70.00', grand_total: '120.00' },
    };
    expect(keysToCamel(raw)).toEqual({
      id: 1,
      totals: { servicesTotal: '50.00', itemsTotal: '70.00', grandTotal: '120.00' },
    });
  });
});
