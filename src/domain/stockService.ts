import type { BookingCommand, Movement } from './types';

export class InventoryError extends Error {}
export function validateCommand(command: BookingCommand) {
  if (!command.operationId || !command.productId) throw new InventoryError('Kies een product en begin een nieuwe boeking.');
  if (!command.locationId || command.locationId === 'all') throw new InventoryError('Kies één voorraadruimte om te boeken.');
  if (!['IN', 'OUT'].includes(command.type)) throw new InventoryError('Kies toevoegen of afboeken.');
  if (!['camera', 'manual', 'productSearch'].includes(command.inputSource)) throw new InventoryError('De invoermethode is ongeldig.');
  if (!Number.isSafeInteger(command.quantityPacks) || command.quantityPacks <= 0) {
    throw new InventoryError('Kies een positief geheel aantal verpakkingen.');
  }
  if (command.inputSource !== 'productSearch' && !command.scannedBarcode) throw new InventoryError('Voer een barcode in of zoek een product.');
  if (command.inputSource === 'productSearch' && command.scannedBarcode !== undefined) throw new InventoryError('Begin opnieuw met barcode-invoer of productkeuze.');
}
export function calculateStock(before: number, type: 'IN' | 'OUT', quantity: number) {
  if (type === 'OUT' && quantity > before) throw new InventoryError(`Er zijn ${before} verpakkingen beschikbaar. Kies maximaal ${before}.`);
  const after = before + (type === 'IN' ? quantity : -quantity);
  if (!Number.isSafeInteger(after)) throw new InventoryError('Dit aantal is te groot om te boeken.');
  return after;
}
export function sameOperation(movement: Movement, command: BookingCommand) {
  return movement.productId === command.productId && movement.locationId === command.locationId &&
    movement.type === command.type && movement.quantityPacks === command.quantityPacks &&
    movement.inputSource === command.inputSource && movement.scannedBarcode === command.scannedBarcode;
}
