import { useRef, useState } from 'react';
import type { BarcodeMapping, InventorySnapshot, Symbology } from '../domain/types';
import { inventory } from '../data/inventoryRepository';
import { InventoryError } from '../domain/stockService';

export function DemoSettings({ data, barcodes }: { data: InventorySnapshot; barcodes: () => void }) {
  const [rawValue, setRawValue] = useState('');
  const [productId, setProductId] = useState(data.products[0].id);
  const [symbology, setSymbology] = useState<Symbology>('EAN_13');
  const [verified, setVerified] = useState(false);
  const [staged, setStaged] = useState<BarcodeMapping>();
  const [names, setNames] = useState<Record<string, string>>(Object.fromEntries(data.locations.map(l => [l.id, l.name])));
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function save(task: () => Promise<unknown>, success: string) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage(''); setError('');
    try { await task(); setMessage(success); }
    catch (e) { setError(e instanceof InventoryError ? e.message : 'Opslaan is niet gelukt. Je invoer is bewaard. Probeer opnieuw.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <><div className="page-heading"><div><p className="eyebrow">Alleen voor de proef</p><h1>Demo-instellingen</h1><p>Beheer testbarcodes en de inrichting van deze lokale demo.</p></div></div>{message && <div className="success" role="status">{message}</div>}{error && <div className="error" role="alert">{error}</div>}
    <div className="settings-layout"><div><section className="card"><h2>Een echte verpakkingsbarcode koppelen</h2><p>Controleer de code op een aanwezige TENA-verpakking. Eén code staat voor één ongeopende verpakking. Doos- en stuksbarcodes zijn niet toegestaan.</p>
      {!staged ? <form className="settings-form" onSubmit={e => { e.preventDefault(); setError(''); setMessage(''); if (!verified) { setError('Controleer eerst de barcode en het verpakkingsniveau.'); return; } setStaged({ id: crypto.randomUUID(), rawValue, productId, symbology, packagingLevel: 'verpakking', quantityInStockUnits: 1, isDemo: false, verified: true }); }}><label>Barcode als tekst<input value={rawValue} onChange={e => setRawValue(e.target.value)} autoComplete="off" required /></label><label>Barcodeformaat<select value={symbology} onChange={e => setSymbology(e.target.value as Symbology)}>{(['EAN_13', 'CODE_128', 'EAN_8', 'UPC_A'] as const).map(s => <option key={s} value={s}>{s.replace('_', '-')}</option>)}</select></label><label>Product<select value={productId} onChange={e => setProductId(e.target.value)}>{data.products.map(p => <option key={p.id} value={p.id}>{p.name} · {p.tenaArticleNumber}</option>)}</select></label><label className="checkbox"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} />Ik heb product, variant en barcode op één ongeopende verpakking gecontroleerd.</label><button className="primary">Koppeling controleren</button></form> : <div><dl className="review-list"><div><dt>Barcode</dt><dd>{staged.rawValue}</dd></div><div><dt>Product</dt><dd>{data.products.find(p => p.id === staged.productId)?.name}</dd></div><div><dt>Formaat / eenheid</dt><dd>{staged.symbology} · 1 verpakking</dd></div></dl><div className="actions"><button className="primary" disabled={busy} onClick={() => void save(async () => { await inventory.addMapping(staged); setStaged(undefined); setRawValue(''); setVerified(false); }, 'De gecontroleerde verpakkingsbarcode is gekoppeld.')}>Koppeling bevestigen</button><button disabled={busy} onClick={() => setStaged(undefined)}>Annuleren / wijzigen</button></div></div>}
    </section><section className="card"><h2>Gekoppelde barcodes</h2><p className="small">Democodes zijn synthetisch en geen officiële TENA-barcodes. Voorloopnullen worden behouden.</p><div className="table-wrap"><table><thead><tr><th>Barcode</th><th>Product</th><th>Type</th></tr></thead><tbody>{data.mappings.map(m => <tr key={m.id}><td>{m.rawValue}<small>{m.symbology} · 1 verpakking</small></td><td>{data.products.find(p => p.id === m.productId)?.name}</td><td>{m.isDemo ? 'Demo' : 'Gecontroleerd'}</td></tr>)}</tbody></table></div></section></div>
      <div><section className="card"><h2>Afdrukbare demobarcodes</h2><p>Code 128 voor alle acht producten en een synthetische EAN-13-code. Print ze of open ze op een tweede scherm.</p><div className="actions"><button className="secondary" onClick={barcodes}>Demobarcodes openen</button></div></section>
      <section className="card"><h2>Namen voorraadruimtes</h2><p className="small">De drie vaste ruimtes zijn H1, H2 en H3. Laat Kim namen en plaatsaanduidingen bevestigen.</p><form className="settings-form" onSubmit={e => { e.preventDefault(); void save(() => inventory.renameLocations(names), 'De ruimtenamen zijn opgeslagen.'); }}>{data.locations.map(l => <label key={l.id}>{l.id}<input value={names[l.id]} maxLength={80} required onChange={e => setNames({ ...names, [l.id]: e.target.value })} /></label>)}<button className="secondary" disabled={busy}>Ruimtenamen opslaan</button></form></section>
      <section className="card"><h2>Demo volledig resetten</h2><p>Herstel de fictieve beginstanden, openingsmutaties, ruimtenamen en demobarcodes. Eigen koppelingen en boekingen verdwijnen.</p>{reset ? <div><p className="notice">Weet je zeker dat je deze lokale demo wilt resetten?</p><div className="actions"><button className="danger" disabled={busy} onClick={() => void save(async () => { await inventory.resetDemo(); setNames({ H1: 'Voorraadruimte 1', H2: 'Voorraadruimte 2', H3: 'Voorraadruimte 3' }); setReset(false); }, 'De demo is teruggezet naar de fictieve beginvoorraad.')}>Ja, demo resetten</button><button disabled={busy} onClick={() => setReset(false)}>Annuleren</button></div></div> : <div className="actions"><button className="danger" onClick={() => setReset(true)}>Demo resetten</button></div>}</section></div>
    </div></>;
}
