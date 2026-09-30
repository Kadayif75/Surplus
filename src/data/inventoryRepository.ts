import type { BarcodeMapping, BookingCommand, InventoryRepository, InventorySnapshot, Movement } from '../domain/types';
import { calculateStock, InventoryError, sameOperation, validateCommand } from '../domain/stockService';
import { InventoryDatabase } from './db';
import { initializeDemo, writeSeed } from './seed';

export class LocalInventoryRepository implements InventoryRepository {
  readonly db: InventoryDatabase;
  constructor(db: InventoryDatabase = new InventoryDatabase()) { this.db = db; }
  initialize() { return initializeDemo(this.db); }
  listProducts() { return this.db.products.toArray(); }
  listLocations() { return this.db.locations.toArray(); }
  getStock() { return this.db.stocks.toArray(); }
  resolveBarcode(rawValue: string) { return this.db.mappings.where('rawValue').equals(rawValue).first(); }
  listMovements() { return this.db.movements.orderBy('createdAt').reverse().toArray(); }
  snapshot(): Promise<InventorySnapshot> {
    return this.db.transaction('r', [this.db.products, this.db.locations, this.db.stocks, this.db.mappings, this.db.movements], async () => ({
      products: await this.listProducts(), locations: await this.listLocations(), stocks: await this.getStock(),
      mappings: await this.db.mappings.toArray(), movements: await this.listMovements(),
    }));
  }
  async bookMovement(command: BookingCommand): Promise<Movement> {
    validateCommand(command);
    return this.db.transaction('rw', [this.db.movements, this.db.stocks, this.db.products, this.db.locations, this.db.mappings], async () => {
      const existing = await this.db.movements.where('operationId').equals(command.operationId).first();
      if (existing) {
        if (!sameOperation(existing, command)) throw new InventoryError('Deze boeking is al gebruikt met andere gegevens. Begin een nieuwe boeking.');
        return existing;
      }
      if (!(await this.db.products.get(command.productId))) throw new InventoryError('Dit product bestaat niet.');
      if (!(await this.db.locations.get(command.locationId))) throw new InventoryError('Kies een geldige voorraadruimte.');
      let mapping: BarcodeMapping | undefined;
      if (command.scannedBarcode !== undefined) {
        mapping = await this.resolveBarcode(command.scannedBarcode);
        if (!mapping) throw new InventoryError('Deze barcode is nog niet gekoppeld.');
        if (mapping.productId !== command.productId || !mapping.verified || mapping.packagingLevel !== 'verpakking' || mapping.quantityInStockUnits !== 1) {
          throw new InventoryError('Deze barcode is geen gecontroleerde koppeling voor deze verpakking.');
        }
      }
      const stock = await this.db.stocks.get([command.productId, command.locationId]);
      if (!stock) throw new InventoryError('De voorraadpositie ontbreekt. Heropen de demo.');
      const stockAfter = calculateStock(stock.quantityPacks, command.type, command.quantityPacks);
      const movement: Movement = {
        ...command, id: crypto.randomUUID(), stockBefore: stock.quantityPacks, stockAfter,
        createdAt: new Date().toISOString(), actor: 'Demogebruiker', isDemoBarcode: mapping?.isDemo ?? false,
      };
      await this.db.stocks.put({ ...stock, quantityPacks: stockAfter });
      await this.db.movements.add(movement);
      return movement;
    });
  }
  async addMapping(mapping: BarcodeMapping) {
    if (!mapping.rawValue || mapping.rawValue !== mapping.rawValue.trim()) throw new InventoryError('Voer een barcode zonder spaties aan het begin of einde in.');
    if (!['CODE_128', 'EAN_13', 'EAN_8', 'UPC_A'].includes(mapping.symbology)) throw new InventoryError('Kies een ondersteund barcodeformaat.');
    const length = { EAN_13: 13, EAN_8: 8, UPC_A: 12 }[mapping.symbology as 'EAN_13' | 'EAN_8' | 'UPC_A'];
    if (length) {
      if (!new RegExp(`^\\d{${length}}$`).test(mapping.rawValue)) throw new InventoryError(`Deze code moet ${length} cijfers bevatten.`);
      const digits = mapping.rawValue.split('').map(Number);
      const sum = digits.slice(0, -1).reverse().reduce((total, digit, i) => total + digit * (i % 2 === 0 ? 3 : 1), 0);
      if ((10 - sum % 10) % 10 !== digits.at(-1)) throw new InventoryError('De controlepositie van deze barcode is ongeldig.');
    }
    if (!mapping.verified || mapping.packagingLevel !== 'verpakking' || mapping.quantityInStockUnits !== 1 || mapping.isDemo) {
      throw new InventoryError('Bevestig een gecontroleerde barcode van één ongeopende verpakking.');
    }
    await this.db.transaction('rw', [this.db.mappings, this.db.products], async () => {
      if (!(await this.db.products.get(mapping.productId))) throw new InventoryError('Kies een bestaand product.');
      if (await this.resolveBarcode(mapping.rawValue)) throw new InventoryError('Deze barcode is al gekoppeld. Dubbele koppelingen zijn niet toegestaan.');
      await this.db.mappings.add(mapping);
    });
  }
  async renameLocations(names: Record<string, string>) {
    await this.db.transaction('rw', this.db.locations, async () => {
      for (const location of await this.listLocations()) {
        const name = names[location.id]?.trim();
        if (!name || name.length > 80) throw new InventoryError('Geef elke ruimte een naam van maximaal 80 tekens.');
        await this.db.locations.put({ ...location, name });
      }
    });
  }
  resetDemo() {
    return this.db.transaction('rw', [this.db.products, this.db.locations, this.db.mappings, this.db.stocks, this.db.movements, this.db.meta], async () => {
      for (const table of [this.db.products, this.db.locations, this.db.mappings, this.db.stocks, this.db.movements, this.db.meta]) await table.clear();
      await writeSeed(this.db);
    });
  }
}
export const inventory = new LocalInventoryRepository();
