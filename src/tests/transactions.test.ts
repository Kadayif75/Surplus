import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InventoryDatabase } from '../data/db';
import { LocalInventoryRepository } from '../data/inventoryRepository';
import type { BookingCommand } from '../domain/types';
let repo: LocalInventoryRepository;
const command = (overrides: Partial<BookingCommand> = {}): BookingCommand => ({ operationId: crypto.randomUUID(), productId: 'tena-760364', locationId: 'H1', type: 'OUT', quantityPacks: 2, inputSource: 'camera', scannedBarcode: 'DEMO-SURPLUS-001', ...overrides });
beforeEach(async () => { repo = new LocalInventoryRepository(new InventoryDatabase(`transaction-${crypto.randomUUID()}`)); await repo.initialize(); });
afterEach(async () => { await repo.db.delete(); });
describe('Transacties en dubbele invoer', () => {
  it('T01: twintig gelijktijdige frames/opslagpogingen met één operationId boeken één keer', async () => {
    const cmd = command(); const results = await Promise.all(Array.from({ length: 20 }, () => repo.bookMovement(cmd)));
    expect(new Set(results.map(m => m.id)).size).toBe(1); expect((await repo.db.stocks.get(['tena-760364','H1']))?.quantityPacks).toBe(8); expect(await repo.listMovements()).toHaveLength(22);
  });
  it.each(['quantityPacks','locationId','productId','inputSource','scannedBarcode','type'] as const)('T02: dezelfde operationId met gewijzigde %s geeft een fout', async field => {
    const cmd = command(); await repo.bookMovement(cmd);
    const different = { quantityPacks: 3, locationId: 'H2', productId: 'tena-750651', inputSource: 'manual', scannedBarcode: 'DEMO-SURPLUS-002', type: 'IN' };
    await expect(repo.bookMovement({ ...cmd, [field]: different[field] } as BookingCommand)).rejects.toThrow('andere gegevens'); expect(await repo.listMovements()).toHaveLength(22);
  });
  it('T03: nieuwe bewuste boeking van hetzelfde product krijgt een nieuwe mutatie', async () => { await repo.bookMovement(command()); await repo.bookMovement(command()); expect((await repo.db.stocks.get(['tena-760364','H1']))?.quantityPacks).toBe(6); expect(await repo.listMovements()).toHaveLength(23); });
  it('T04: actuele voorraad wordt in transactie opnieuw gecontroleerd bij concurrerende boekingen', async () => {
    const results = await Promise.allSettled([repo.bookMovement(command({ quantityPacks: 7 })), repo.bookMovement(command({ quantityPacks: 7 }))]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1); expect(results.filter(r => r.status === 'rejected')).toHaveLength(1); expect((await repo.db.stocks.get(['tena-760364','H1']))?.quantityPacks).toBe(3); expect(await repo.listMovements()).toHaveLength(22);
  });
  it('T05: schrijffout na voorraadwijziging rolt voorraad en historie volledig terug, retry slaagt eenmaal', async () => {
    const cmd = command(); const before = await repo.snapshot();
    const fail = () => { throw new Error('Geforceerde opslagfout'); };
    repo.db.movements.hook('creating', fail);
    await expect(repo.bookMovement(cmd)).rejects.toThrow('Geforceerde opslagfout'); expect(await repo.snapshot()).toEqual(before);
    repo.db.movements.hook('creating').unsubscribe(fail);
    const first = await repo.bookMovement(cmd); const retry = await repo.bookMovement(cmd); expect(retry.id).toBe(first.id); expect(await repo.listMovements()).toHaveLength(22);
  });
});
