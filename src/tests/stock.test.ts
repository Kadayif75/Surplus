import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InventoryDatabase } from '../data/db';
import { LocalInventoryRepository } from '../data/inventoryRepository';
import type { BarcodeMapping, BookingCommand } from '../domain/types';

let repo: LocalInventoryRepository;
const command = (overrides: Partial<BookingCommand> = {}): BookingCommand => ({ operationId: crypto.randomUUID(), productId: 'tena-760364', locationId: 'H1', type: 'OUT', quantityPacks: 2, inputSource: 'manual', scannedBarcode: 'DEMO-SURPLUS-001', ...overrides });
beforeEach(async () => { repo = new LocalInventoryRepository(new InventoryDatabase(`test-${crypto.randomUUID()}`)); await repo.initialize(); });
afterEach(async () => { await repo.db.delete(); });

describe('Fictieve beginvoorraad en demonstratiescript', () => {
  it('S01: exact acht producten, drie ruimtes, 24 standen, 21 positieve openingsmutaties, negen democodes', async () => {
    const snapshot = await repo.snapshot();
    expect(snapshot.products).toHaveLength(8); expect(snapshot.locations.map(l => l.id)).toEqual(['H1', 'H2', 'H3']);
    expect(snapshot.stocks).toHaveLength(24); expect(snapshot.movements).toHaveLength(21); expect(snapshot.mappings).toHaveLength(9);
    const expected = { '760364': [10,6,4], '760384': [2,0,5], '750651': [3,4,1], '750776': [0,2,6], '791528': [8,5,3], '791628': [6,2,0], '761425': [4,4,4], '761531': [1,3,2] };
    for (const [article, amounts] of Object.entries(expected)) {
      expect(['H1','H2','H3'].map(id => snapshot.stocks.find(s => s.productId === `tena-${article}` && s.locationId === id)?.quantityPacks)).toEqual(amounts);
    }
    expect(snapshot.movements.every(m => m.type === 'OPENING' && m.quantityPacks > 0 && m.stockBefore === 0 && m.stockAfter === m.quantityPacks)).toBe(true);
    expect(snapshot.mappings.every(m => m.isDemo && m.verified && m.quantityInStockUnits === 1)).toBe(true);
  });
  it('S02: afboeken H1 geeft 8/6/4 en totaal 18, toevoegen H2 geeft 8/9/4 en totaal 21', async () => {
    await repo.bookMovement(command());
    let stocks = (await repo.getStock()).filter(s => s.productId === 'tena-760364');
    expect(stocks.map(s => s.quantityPacks)).toEqual([8, 6, 4]); expect(stocks.reduce((sum, s) => sum + s.quantityPacks, 0)).toBe(18);
    await repo.bookMovement(command({ locationId: 'H2', type: 'IN', quantityPacks: 3 }));
    stocks = (await repo.getStock()).filter(s => s.productId === 'tena-760364');
    expect(stocks.map(s => s.quantityPacks)).toEqual([8, 9, 4]); expect(stocks.reduce((sum, s) => sum + s.quantityPacks, 0)).toBe(21);
    expect((await repo.listMovements()).filter(m => m.type !== 'OPENING')).toHaveLength(2);
  });
  it('S03: opnieuw openen en initialiseren behoudt standen en historie', async () => {
    await repo.bookMovement(command()); const name = repo.db.name; repo.db.close();
    repo = new LocalInventoryRepository(new InventoryDatabase(name)); await repo.initialize();
    expect((await repo.db.stocks.get(['tena-760364', 'H1']))?.quantityPacks).toBe(8);
    expect(await repo.listMovements()).toHaveLength(22);
  });
  it('S04: herkennen verandert geen stand of historie, ook niet bij onbekende code', async () => {
    const before = await repo.snapshot();
    expect((await repo.resolveBarcode('DEMO-SURPLUS-001'))?.productId).toBe('tena-760364');
    expect((await repo.resolveBarcode('2000000000015'))?.isDemo).toBe(true);
    expect(await repo.resolveBarcode('ONBEKEND')).toBeUndefined();
    expect(await repo.snapshot()).toEqual(before);
  });
  it('S05: productkeuze gebruikt dezelfde boekingsservice en bewaart de invoerbron', async () => {
    const m = await repo.bookMovement(command({ inputSource: 'productSearch', scannedBarcode: undefined }));
    expect(m.inputSource).toBe('productSearch'); expect(m.isDemoBarcode).toBe(false); expect(m.stockAfter).toBe(8);
  });
  it('S06: echte camerascan van democode blijft camera met apart demokenmerk', async () => {
    const m = await repo.bookMovement(command({ inputSource: 'camera' }));
    expect(m.inputSource).toBe('camera'); expect(m.isDemoBarcode).toBe(true); expect(m.scannedBarcode).toBe('DEMO-SURPLUS-001');
  });
});

describe('Invoercontroles zonder ongewenste mutaties', () => {
  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('V01: ongeldig aantal %s', async quantityPacks => {
    const before = await repo.snapshot(); await expect(repo.bookMovement(command({ quantityPacks }))).rejects.toThrow('positief geheel'); expect(await repo.snapshot()).toEqual(before);
  });
  it.each(['', 'all', 'H9'])('V02: ontbrekende of ongeldige ruimte %s', async locationId => {
    const before = await repo.snapshot(); await expect(repo.bookMovement(command({ locationId }))).rejects.toThrow(); expect(await repo.snapshot()).toEqual(before);
  });
  it('V03: onvoldoende voorraad geeft bruikbare melding', async () => {
    const before = await repo.snapshot(); await expect(repo.bookMovement(command({ quantityPacks: 11 }))).rejects.toThrow('Er zijn 10 verpakkingen beschikbaar. Kies maximaal 10.'); expect(await repo.snapshot()).toEqual(before);
  });
  it('V04: onbekende barcode kan niet boeken', async () => {
    const before = await repo.snapshot(); await expect(repo.bookMovement(command({ scannedBarcode: 'ONBEKEND' }))).rejects.toThrow('nog niet gekoppeld'); expect(await repo.snapshot()).toEqual(before);
  });
  it('V05: barcode gekoppeld aan ander product kan niet boeken', async () => {
    await expect(repo.bookMovement(command({ scannedBarcode: 'DEMO-SURPLUS-002' }))).rejects.toThrow('gecontroleerde koppeling'); expect(await repo.listMovements()).toHaveLength(21);
  });
  it('V06: niet bestaand product of ontbrekende barcode kan niet boeken', async () => {
    await expect(repo.bookMovement(command({ productId: 'onbekend' }))).rejects.toThrow('bestaat niet');
    await expect(repo.bookMovement(command({ scannedBarcode: undefined }))).rejects.toThrow('Voer een barcode');
  });
  it('V07: nulpositie blijft bestaan na volledig afboeken', async () => {
    await repo.bookMovement(command({ quantityPacks: 10 })); expect((await repo.db.stocks.get(['tena-760364','H1']))?.quantityPacks).toBe(0); expect(await repo.listProducts()).toHaveLength(8); expect(await repo.listMovements()).toHaveLength(22);
  });
});

describe('Gecontroleerde barcodekoppelingen en reset', () => {
  const realMapping = (overrides: Partial<BarcodeMapping> = {}): BarcodeMapping => ({ id: crypto.randomUUID(), rawValue: '0001234567895', symbology: 'EAN_13', productId: 'tena-760364', packagingLevel: 'verpakking', quantityInStockUnits: 1, isDemo: false, verified: true, ...overrides });
  it('B01: koppeling behoudt voorloopnullen, ruwe scan en echte-barcodekenmerk', async () => {
    await repo.addMapping(realMapping()); expect(await repo.resolveBarcode('1234567895')).toBeUndefined();
    const m = await repo.bookMovement(command({ scannedBarcode: '0001234567895', inputSource: 'camera' })); expect(m.scannedBarcode).toBe('0001234567895'); expect(m.isDemoBarcode).toBe(false);
  });
  it('B02: dubbele en tegenstrijdige koppelingen zijn verboden', async () => {
    await repo.addMapping(realMapping()); await expect(repo.addMapping(realMapping())).rejects.toThrow('al gekoppeld'); await expect(repo.addMapping(realMapping({ productId: 'tena-750651' }))).rejects.toThrow('al gekoppeld');
  });
  it('B03: EAN met ongeldige controlepositie wordt afgewezen', async () => { await expect(repo.addMapping(realMapping({ rawValue: '0001234567890' }))).rejects.toThrow('controlepositie'); });
  it('B04: ongecontroleerde en doosbarcodes worden afgewezen', async () => {
    await expect(repo.addMapping(realMapping({ verified: false }))).rejects.toThrow('gecontroleerde');
    await expect(repo.addMapping(realMapping({ packagingLevel: 'doos' as 'verpakking' }))).rejects.toThrow('gecontroleerde');
  });
  it('B05: reset herstelt standen, historie, demokoppelingen en ruimtenamen', async () => {
    await repo.bookMovement(command()); await repo.addMapping(realMapping()); await repo.renameLocations({ H1: 'Kast A', H2: 'Kast B', H3: 'Kast C' });
    await repo.resetDemo(); await repo.initialize(); expect((await repo.db.stocks.get(['tena-760364','H1']))?.quantityPacks).toBe(10); expect(await repo.listMovements()).toHaveLength(21); expect(await repo.resolveBarcode('0001234567895')).toBeUndefined(); expect(await repo.db.mappings.count()).toBe(9); expect((await repo.listLocations())[0].name).toBe('Voorraadruimte 1');
  });
});
