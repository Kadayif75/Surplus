import type { BarcodeMapping, Location, Product, StockPosition, Movement } from '../domain/types';
import type { InventoryDatabase } from './db';

const rows: [string, string, string, number, number, number[], number][] = [
  ['760364', 'TENA Discreet Mini', 'Mini', 6, 30, [10, 6, 4], 11],
  ['760384', 'TENA Discreet Mini Plus', 'Mini Plus', 6, 20, [2, 0, 5], 12],
  ['750651', 'TENA Men Level 1', 'Level 1', 6, 24, [3, 4, 1], 15],
  ['750776', 'TENA Men Level 2', 'Level 2', 6, 20, [0, 2, 6], 16],
  ['791528', 'TENA Pants Normal ProSkin Medium', 'Medium', 4, 18, [8, 5, 3], 20],
  ['791628', 'TENA Pants Normal ProSkin Large', 'Large', 4, 18, [6, 2, 0], 21],
  ['761425', 'TENA Comfort Mini Plus', 'Mini Plus', 6, 30, [4, 4, 4], 57],
  ['761531', 'TENA Comfort Mini Extra', 'Mini Extra', 8, 30, [1, 3, 2], 58],
];
export const seedProducts: Product[] = rows.map(([article, name, variant, packsPerBox, piecesPerPack, , row]) => ({
  id: `tena-${article}`, tenaArticleNumber: article, name, variant, packsPerBox, piecesPerPack,
  stockUnit: 'verpakking', sourceReference: `Aangeleverde werkmap: Totaal!A${row}:E${row}`, assortmentVerified: false,
}));
export const seedLocations: Location[] = [1, 2, 3].map(n => ({
  id: `H${n}`, name: `Voorraadruimte ${n}`, description: 'Naam en plaats nog te bevestigen door Kim.', locationVerified: false,
}));
export const seedMappings: BarcodeMapping[] = seedProducts.map((product, i) => ({
  id: `demo-${i + 1}`, rawValue: `DEMO-SURPLUS-${String(i + 1).padStart(3, '0')}`, symbology: 'CODE_128',
  productId: product.id, packagingLevel: 'verpakking', quantityInStockUnits: 1, isDemo: true, verified: true,
}));
seedMappings.push({ ...seedMappings[0], id: 'demo-ean', rawValue: '2000000000015', symbology: 'EAN_13' });

export async function writeSeed(db: InventoryDatabase) {
  const stocks: StockPosition[] = rows.flatMap(([article, , , , , quantities]) => quantities.map((quantityPacks, i) => ({
    productId: `tena-${article}`, locationId: `H${i + 1}`, quantityPacks,
  })));
  const createdAt = new Date().toISOString();
  const movements: Movement[] = stocks.filter(s => s.quantityPacks > 0).map(s => ({
    id: `opening-${s.productId}-${s.locationId}`, operationId: `opening-${s.productId}-${s.locationId}`,
    productId: s.productId, locationId: s.locationId, type: 'OPENING', quantityPacks: s.quantityPacks,
    stockBefore: 0, stockAfter: s.quantityPacks, createdAt, actor: 'Demogebruiker', inputSource: 'seed', isDemoBarcode: false,
  }));
  await db.products.bulkPut(seedProducts);
  await db.locations.bulkPut(seedLocations);
  await db.mappings.bulkPut(seedMappings);
  await db.stocks.bulkPut(stocks);
  await db.movements.bulkPut(movements);
  await db.meta.put({ key: 'seedVersion', value: 1 });
}
export async function initializeDemo(db: InventoryDatabase) {
  await db.transaction('rw', [db.products, db.locations, db.mappings, db.stocks, db.movements, db.meta], async () => {
    if (!(await db.meta.get('seedVersion'))) await writeSeed(db);
  });
}
