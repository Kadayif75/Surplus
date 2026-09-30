import Dexie, { type Table } from 'dexie';
import type { Product, Location, BarcodeMapping, StockPosition, Movement } from '../domain/types';

export class InventoryDatabase extends Dexie {
  products!: Table<Product, string>;
  locations!: Table<Location, string>;
  mappings!: Table<BarcodeMapping, string>;
  stocks!: Table<StockPosition, [string, string]>;
  movements!: Table<Movement, string>;
  meta!: Table<{ key: string; value: number }, string>;
  constructor(name = 'surplus-voorraad-demo-v1') {
    super(name);
    this.version(1).stores({
      products: 'id, &tenaArticleNumber', locations: 'id',
      mappings: 'id, &rawValue, productId', stocks: '[productId+locationId], productId, locationId',
      movements: 'id, &operationId, createdAt, productId, locationId', meta: 'key',
    });
  }
}
