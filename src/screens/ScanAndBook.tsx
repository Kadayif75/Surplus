import { useRef, useState } from 'react';
import type { BookingCommand, InventorySnapshot, Movement, Symbology } from '../domain/types';
import { inventory } from '../data/inventoryRepository';
import { InventoryError } from '../domain/stockService';
import { BarcodeScanner } from '../scanner/BarcodeScanner';

interface Props { data: InventorySnapshot; room: string; setRoom: (id: string) => void; initialProduct?: string; initialAction: 'IN' | 'OUT'; back: () => void }
export function ScanAndBook({ data, room, setRoom, initialProduct, initialAction, back }: Props) {
  const initial = initialProduct && room !== 'all' ? { operationId: crypto.randomUUID(), productId: initialProduct, locationId: room, type: initialAction, quantityPacks: 1, inputSource: 'productSearch' as const } : undefined;
  const [stage, setStage] = useState<'setup' | 'identify' | 'review' | 'success'>(initial ? 'review' : 'setup');
  const [action, setAction] = useState<'IN' | 'OUT'>(initialAction);
  const [draft, setDraft] = useState<BookingCommand | undefined>(initial);
  const [number, setNumber] = useState('1');
  const [raw, setRaw] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [result, setResult] = useState<Movement>();
  const [cameraKey, setCameraKey] = useState(0);
  const bookingLock = useRef(false);
  const detectionLock = useRef(false);
  const retryCommand = useRef<BookingCommand | undefined>(undefined);
  const roomRef = useRef(room);
  const actionRef = useRef(action);
  const product = data.products.find(p => p.id === draft?.productId);
  const location = data.locations.find(l => l.id === draft?.locationId);
  const stock = data.stocks.find(s => s.productId === draft?.productId && s.locationId === draft?.locationId)?.quantityPacks ?? 0;
  const mapping = data.mappings.find(m => m.rawValue === draft?.scannedBarcode);
  const quantity = Number(number);
  const valid = /^\d+$/.test(number) && Number.isSafeInteger(quantity) && quantity > 0 && (draft?.type !== 'OUT' || quantity <= stock);
  function begin() {
    if (!data.locations.some(l => l.id === room)) { setError('Kies één voorraadruimte om te boeken.'); return; }
    roomRef.current = room; actionRef.current = action;
    detectionLock.current = false; retryCommand.current = undefined;
    setError(''); setStage('identify'); setRaw(''); setNumber('1'); setCameraKey(k => k + 1);
  }
  function choose(productId: string, source: 'camera' | 'manual' | 'productSearch', barcode?: string) {
    setDraft({ operationId: crypto.randomUUID(), productId, locationId: roomRef.current, type: actionRef.current, quantityPacks: 1, inputSource: source, scannedBarcode: barcode });
    setNumber('1'); setError(''); setStage('review');
  }
  async function identify(value: string, source: 'camera' | 'manual', format?: Symbology) {
    if (detectionLock.current) return;
    detectionLock.current = true; setResolving(true); setError(''); setRaw(value);
    try {
      const matched = await inventory.resolveBarcode(value);
      if (!matched) throw new InventoryError('Deze barcode is nog niet gekoppeld. Zoek het product of koppel een gecontroleerde verpakkingsbarcode in de demo-instellingen.');
      if (!matched.verified || matched.packagingLevel !== 'verpakking' || matched.quantityInStockUnits !== 1 || (format && format !== matched.symbology)) throw new InventoryError('De barcode of het verpakkingsniveau komt niet overeen met de gecontroleerde koppeling. Gebruik product zoeken.');
      choose(matched.productId, source, value);
    } catch (e) {
      setError(e instanceof InventoryError ? e.message : 'De barcodekoppeling kan niet worden gelezen. Probeer opnieuw.');
      detectionLock.current = false;
    } finally { setResolving(false); }
  }
  async function confirm() {
    if (bookingLock.current || !draft) return;
    if (!valid && !retryCommand.current) { setError(draft.type === 'OUT' && quantity > stock ? `Er zijn ${stock} verpakkingen beschikbaar. Kies maximaal ${stock}.` : 'Kies een positief geheel aantal verpakkingen.'); return; }
    bookingLock.current = true; setBusy(true); setError('');
    // A retry after an uncertain storage outcome uses the original command and ID.
    const command = retryCommand.current ?? { ...draft, quantityPacks: quantity };
    retryCommand.current = command;
    try {
      const movement = await inventory.bookMovement(command);
      setResult(movement); setStage('success');
    } catch (e) {
      if (e instanceof InventoryError) retryCommand.current = undefined;
      setError(e instanceof InventoryError ? e.message : 'Opslaan is niet gelukt. Je invoer is bewaard. Probeer dezelfde boeking opnieuw; er wordt geen dubbele mutatie gemaakt.');
    } finally { bookingLock.current = false; setBusy(false); }
  }
  function cancel() { if (busy) return; setDraft(undefined); retryCommand.current = undefined; setError(''); setStage('setup'); }
  return <div className="flow-container"><div className="page-heading"><div><p className="eyebrow">Ganshoek / voorraadbeheer</p><h1>Scannen & boeken</h1><p>Een scan verandert de voorraad pas na jouw bevestiging.</p></div></div>
    <ol className="step-list">{['Ruimte & actie', 'Product herkennen', 'Controleren', 'Opgeslagen'].map((s, i) => <li key={s} className={['setup', 'identify', 'review', 'success'][i] === stage ? 'active' : ''}>{i + 1}. {s}</li>)}</ol>
    {error && <div role="alert" className="error">{error}</div>}
    {stage === 'setup' && <section className="card flow-card"><h2>Waar wil je boeken?</h2><p>Kies een ruimte en de gewenste actie.</p><div className="form-grid"><label>Voorraadruimte<select value={room} onChange={e => { setRoom(e.target.value); setError(''); }}><option value="all">Kies één voorraadruimte</option>{data.locations.map(l => <option key={l.id} value={l.id}>{l.id} · {l.name}</option>)}</select></label><div><span>Actie</span><div className="segmented"><button aria-pressed={action === 'IN'} onClick={() => setAction('IN')}>Toevoegen</button><button aria-pressed={action === 'OUT'} onClick={() => setAction('OUT')}>Afboeken</button></div></div></div><div className="actions"><button className="primary" onClick={begin}>Verder naar product</button><button onClick={back}>Terug naar voorraad</button></div></section>}
    {stage === 'identify' && <section className="card flow-card"><h2>Herken de verpakking</h2><p><b>{data.locations.find(l => l.id === roomRef.current)?.name}</b> · {actionRef.current === 'IN' ? 'Toevoegen' : 'Afboeken'}</p><BarcodeScanner key={cameraKey} onDetected={(value, format) => void identify(value, 'camera', format)} /><form className="manual-form" onSubmit={e => { e.preventDefault(); void identify(raw, 'manual'); }}><label>Barcode handmatig invoeren<input value={raw} autoComplete="off" spellCheck={false} onChange={e => setRaw(e.target.value)} placeholder="Bijvoorbeeld DEMO-SURPLUS-001" /></label><button className="secondary" disabled={!raw || resolving}>Product herkennen</button></form><button className="text-button" onClick={() => setShowSearch(!showSearch)}>Product zoeken</button>{showSearch && <div><label>Zoek op naam of artikelnummer<input type="search" value={search} onChange={e => setSearch(e.target.value)} /></label><div className="pick-products">{data.products.filter(p => `${p.name} ${p.tenaArticleNumber}`.toLowerCase().includes(search.toLowerCase())).map(p => <button key={p.id} disabled={resolving} onClick={() => choose(p.id, 'productSearch')}>{p.name}<small> · {p.tenaArticleNumber}</small></button>)}</div></div>}<div className="actions"><button onClick={cancel}>Ruimte of actie wijzigen</button><button onClick={back}>Annuleren</button></div></section>}
    {stage === 'review' && draft && product && <section className="card flow-card"><p className="eyebrow">Controleer vóór het boeken</p><h2>{product.name}</h2><dl className="review-list"><div><dt>Variant / artikel</dt><dd>{product.variant} · {product.tenaArticleNumber}</dd></div><div><dt>Voorraadruimte</dt><dd>{draft.locationId} · {location?.name}</dd></div><div><dt>Actie</dt><dd>{draft.type === 'IN' ? 'Toevoegen' : 'Afboeken'}</dd></div><div><dt>Invoer</dt><dd>{draft.inputSource === 'camera' ? 'Camera' : draft.inputSource === 'manual' ? 'Handmatig' : 'Productkeuze'}{mapping?.isDemo && <span className="badge">Demobarcode</span>}{draft.scannedBarcode && <small>{draft.scannedBarcode}</small>}</dd></div></dl><label htmlFor="quantity">Aantal verpakkingen</label><div className="quantity-control"><button aria-label="Eén verpakking minder" disabled={busy || !!retryCommand.current || quantity <= 1} onClick={() => { setNumber(String(Math.max(1, (Number.isFinite(quantity) ? quantity : 1) - 1))); setError(''); }}>−</button><input id="quantity" type="text" inputMode="numeric" pattern="[0-9]*" value={number} disabled={busy || !!retryCommand.current} onChange={e => { setNumber(e.target.value); setError(''); }} /><button aria-label="Eén verpakking meer" disabled={busy || !!retryCommand.current} onClick={() => { setNumber(String((Number.isFinite(quantity) ? quantity : 0) + 1)); setError(''); }}>+</button></div>{!valid && <p className="error">{draft.type === 'OUT' && quantity > stock ? `Er zijn ${stock} verpakkingen beschikbaar. Kies maximaal ${stock}.` : 'Kies een positief geheel aantal verpakkingen.'}</p>}<div className="stock-preview"><span>Voorraad in {draft.locationId}</span><strong>{stock} → {valid ? stock + (draft.type === 'IN' ? quantity : -quantity) : '—'} <small>verpakkingen</small></strong></div><div className="actions"><button className="primary" disabled={busy || (!valid && !retryCommand.current)} onClick={() => void confirm()}>{busy ? 'Bezig met opslaan…' : `${number} ${quantity === 1 ? 'verpakking' : 'verpakkingen'} ${draft.type === 'IN' ? 'toevoegen' : 'afboeken'}`}</button><button disabled={busy} onClick={cancel}>Annuleren / wijzigen</button></div></section>}
    {stage === 'success' && result && <section className="card flow-card"><div role="status" className="success"><strong>Voorraad opgeslagen</strong><p>{product?.name} · {location?.name}</p><p>{result.quantityPacks} verpakkingen {result.type === 'IN' ? 'toegevoegd' : 'afgeboekt'}. Voorraad: {result.stockBefore} → {result.stockAfter}.</p></div><p>Haal de gescande verpakking uit beeld voordat je verdergaat.</p><div className="actions"><button className="primary" onClick={begin}>Volgend product scannen</button><button onClick={back}>Terug naar voorraad</button><button onClick={cancel}>Andere ruimte of actie</button></div></section>}
  </div>;
}
