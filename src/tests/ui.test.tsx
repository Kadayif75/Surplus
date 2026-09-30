// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BarcodeFormat } from '@zxing/library';
import { BarcodeScanner } from '../scanner/BarcodeScanner';
import { ScanAndBook } from '../screens/ScanAndBook';
import { inventory } from '../data/inventoryRepository';
import type { InventorySnapshot, Movement } from '../domain/types';

const decoder = vi.hoisted(() => ({ callback: undefined as undefined | ((result: unknown, error: unknown, controls: {stop: () => void}) => void), stop: vi.fn() }));
vi.mock('@zxing/browser', () => ({ BrowserMultiFormatReader: class {
  async decodeFromStream(_stream: unknown, _video: unknown, callback: typeof decoder.callback) { decoder.callback = callback; return { stop: decoder.stop }; }
} }));
let container: HTMLDivElement;
let root: Root;
let cameraStop: ReturnType<typeof vi.fn>;
let getUserMedia: ReturnType<typeof vi.fn>;
const fakeStream = () => ({ getTracks: () => [{ stop: cameraStop }] }) as unknown as MediaStream;
async function click(name: string) {
  const button = [...container.querySelectorAll('button')].find(b => b.textContent?.trim() === name);
  expect(button, `Knop ontbreekt: ${name}`).toBeDefined();
  await act(async () => { button!.click(); });
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
  Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  cameraStop = vi.fn(); getUserMedia = vi.fn(async () => fakeStream());
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  decoder.callback = undefined; decoder.stop.mockClear();
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.useRealTimers();
});
describe('Cameralevenscyclus met nagebootste camera', () => {
  it('C01: toestemming wordt pas na een bewuste klik gevraagd, alleen video met ideale achtercamera', async () => {
    await act(async () => root.render(<BarcodeScanner onDetected={vi.fn()} />));
    expect(getUserMedia).not.toHaveBeenCalled(); await click('Camera starten');
    expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    const video = container.querySelector('video')!; expect(video.hasAttribute('playsinline')).toBe(true); expect(video.muted).toBe(true); expect(video.autoplay).toBe(true);
  });
  it('C02: herhaalde cameraframes herkennen eenmaal en stoppen cameratracks', async () => {
    const found = vi.fn(); await act(async () => root.render(<BarcodeScanner onDetected={found} />)); await click('Camera starten');
    const result = { getText: () => 'DEMO-SURPLUS-001', getBarcodeFormat: () => BarcodeFormat.CODE_128 };
    await act(async () => { decoder.callback!(result, undefined, { stop: decoder.stop }); decoder.callback!(result, undefined, { stop: decoder.stop }); });
    expect(found).toHaveBeenCalledExactlyOnceWith('DEMO-SURPLUS-001', 'CODE_128'); expect(cameraStop).toHaveBeenCalledOnce(); expect(container.textContent).toContain('Camera starten');
  });
  it('C03: sluiten van scanner stopt alle tracks en decoder', async () => {
    await act(async () => root.render(<BarcodeScanner onDetected={vi.fn()} />)); await click('Camera starten'); await act(async () => root.render(<p>Gesloten</p>)); expect(cameraStop).toHaveBeenCalledOnce(); expect(decoder.stop).toHaveBeenCalled();
  });
  it('C04: achtergrond plaatsen stopt camera en vraagt een nieuwe startactie', async () => {
    await act(async () => root.render(<BarcodeScanner onDetected={vi.fn()} />)); await click('Camera starten');
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    await act(async () => document.dispatchEvent(new Event('visibilitychange')));
    expect(cameraStop).toHaveBeenCalledOnce(); expect(container.textContent).toContain('achtergrond'); expect(getUserMedia).toHaveBeenCalledOnce();
  });
  it('C05: laat ontvangen camera na sluiten wordt direct gestopt', async () => {
    let grant!: (stream: MediaStream) => void;
    getUserMedia.mockImplementation(() => new Promise<MediaStream>(resolve => { grant = resolve; }));
    const found = vi.fn(); await act(async () => root.render(<BarcodeScanner onDetected={found} />)); await click('Camera starten'); await act(async () => root.render(<p>Gesloten</p>));
    await act(async () => grant(fakeStream())); expect(cameraStop).toHaveBeenCalledOnce(); expect(decoder.callback).toBeUndefined(); expect(found).not.toHaveBeenCalled();
  });
  it.each([['NotAllowedError','geweigerd'],['NotFoundError','geen geschikte camera'],['NotReadableError','bezet']])('C06: fout %s geeft een bruikbare Nederlandse melding', async (name, text) => {
    getUserMedia.mockRejectedValue(new DOMException('Camera test', name)); await act(async () => root.render(<BarcodeScanner onDetected={vi.fn()} />)); await click('Camera starten'); expect(container.textContent).toContain(text); expect(container.textContent).toContain('Camera starten');
  });
  it('C07: verlopen scantijd stopt de camera en toont tips en uitwijkmogelijkheid', async () => {
    vi.useFakeTimers(); await act(async () => root.render(<BarcodeScanner onDetected={vi.fn()} />)); await click('Camera starten'); await act(async () => vi.advanceTimersByTime(20000)); expect(cameraStop).toHaveBeenCalledOnce(); expect(container.textContent).toContain('Nog geen code herkend'); expect(container.textContent).toContain('handmatig');
  });
});

describe('Bevestigen met nagebootste opslagfouten', () => {
  let snapshot: InventorySnapshot;
  beforeEach(async () => { await inventory.initialize(); await inventory.resetDemo(); snapshot = await inventory.snapshot(); });
  const mount = async () => { await act(async () => root.render(<ScanAndBook data={snapshot} room="H1" setRoom={vi.fn()} initialProduct="tena-760364" initialAction="OUT" back={vi.fn()} />)); };
  it('U01: annuleren maakt geen voorraadmutatie', async () => { const book = vi.spyOn(inventory, 'bookMovement'); await mount(); await click('Annuleren / wijzigen'); expect(book).not.toHaveBeenCalled(); expect(await inventory.snapshot()).toEqual(snapshot); });
  it('U02: twee directe tikken tijdens opslag sturen één opdracht', async () => {
    let complete!: (movement: Movement) => void;
    const book = vi.spyOn(inventory, 'bookMovement').mockImplementation(() => new Promise(resolve => { complete = resolve; }));
    await mount(); const button = [...container.querySelectorAll('button')].find(b => b.textContent === '1 verpakking afboeken')!;
    await act(async () => { button.click(); button.click(); }); expect(book).toHaveBeenCalledOnce(); expect(container.textContent).not.toContain('Voorraad opgeslagen');
    const command = book.mock.calls[0][0]; await act(async () => complete({ ...command, id:'test', createdAt:new Date().toISOString(), stockBefore:10, stockAfter:9, actor:'Demogebruiker', isDemoBarcode:false })); expect(container.textContent).toContain('Voorraad opgeslagen');
  });
  it('U03: opslagfout toont geen succes, behoudt aantal en hergebruikt operationId bij retry', async () => {
    const original = inventory.bookMovement.bind(inventory);
    const book = vi.spyOn(inventory, 'bookMovement').mockRejectedValueOnce(new Error('Opslag niet beschikbaar')).mockImplementation(original);
    await mount(); await click('1 verpakking afboeken'); expect(container.textContent).toContain('Opslaan is niet gelukt'); expect(container.textContent).not.toContain('Voorraad opgeslagen'); expect(container.querySelector<HTMLInputElement>('#quantity')?.value).toBe('1');
    expect(await inventory.snapshot()).toEqual(snapshot); await click('1 verpakking afboeken'); await act(async () => { await book.mock.results[1].value; }); expect(book.mock.calls[0][0].operationId).toBe(book.mock.calls[1][0].operationId); expect(container.textContent).toContain('Voorraad opgeslagen'); expect((await inventory.listMovements()).filter(m => m.type !== 'OPENING')).toHaveLength(1);
  });
  it('U04: onzekere opslaguitkomst na commit kan ook bij nulvoorraad veilig opnieuw worden opgevraagd', async () => {
    const original = inventory.bookMovement.bind(inventory);
    const book = vi.spyOn(inventory, 'bookMovement').mockImplementationOnce(async command => { await original(command); throw new Error('Antwoord niet ontvangen'); }).mockImplementation(original);
    await mount();
    for (let i = 1; i < 10; i++) {
      await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Eén verpakking meer"]')!.click());
    }
    await click('10 verpakkingen afboeken'); await act(async () => { try { await book.mock.results[0].value; } catch { /* Injected uncertain outcome. */ } });
    snapshot = await inventory.snapshot(); await mount(); expect(snapshot.stocks.find(s => s.productId === 'tena-760364' && s.locationId === 'H1')?.quantityPacks).toBe(0);
    await click('10 verpakkingen afboeken'); await act(async () => { await book.mock.results[1].value; });
    expect(container.textContent).toContain('Voorraad opgeslagen'); expect((await inventory.listMovements()).filter(m => m.type !== 'OPENING')).toHaveLength(1);
  });
});
