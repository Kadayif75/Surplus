import { useEffect, useState } from 'react';
import { liveQuery, type Subscription } from 'dexie';
import { inventory } from './data/inventoryRepository';
import type { InventorySnapshot } from './domain/types';
import { StockOverview } from './screens/StockOverview';
import { ScanAndBook } from './screens/ScanAndBook';
import { MovementHistory } from './screens/MovementHistory';
import { DemoSettings } from './screens/DemoSettings';
import { DemoBarcodes } from './screens/DemoBarcodes';
import './styles.css';

type Page = 'stock' | 'scan' | 'history' | 'settings' | 'barcodes';
export default function App() {
  const [page, setPage] = useState<Page>('stock');
  const [data, setData] = useState<InventorySnapshot>();
  const [error, setError] = useState('');
  const [room, setRoom] = useState('H1');
  const [startProduct, setStartProduct] = useState<string>();
  const [action, setAction] = useState<'IN' | 'OUT'>('OUT');
  useEffect(() => {
    let subscription: Subscription | undefined;
    let disposed = false;
    inventory.initialize().then(() => {
      if (disposed) return;
      subscription = liveQuery(() => inventory.snapshot()).subscribe({ next: setData, error: () => setError('De lokale opslag is niet beschikbaar. Heropen de app of probeer een toegestaan browserprofiel.') });
    }).catch(() => setError('De demo kan de lokale opslag niet openen. Probeer opnieuw in een toegestaan browserprofiel.'));
    return () => { disposed = true; subscription?.unsubscribe(); };
  }, []);
  function navigate(next: Page) { setStartProduct(undefined); setPage(next); }
  function book(productId: string, type: 'IN' | 'OUT') { setStartProduct(productId); setAction(type); setPage('scan'); }
  return <>
    <a className="skip" href="#main">Naar de inhoud</a>
    <header className="app-header"><div className="brand"><strong>Surplus <span>Voorraad</span></strong><span className="site-name">Ganshoek</span></div><span className="demo-status">Lokale demo: geen gedeelde voorraad</span></header>
    <nav className="app-nav" aria-label="Hoofdnavigatie">{([['stock', 'Voorraad'], ['scan', 'Scannen & boeken'], ['history', 'Mutaties'], ['settings', 'Demo-instellingen']] as const).map(([id, label]) => <button key={id} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}>{label}</button>)}</nav>
    <main id="main">{error ? <div className="error" role="alert">{error}</div> : !data ? <p role="status">Demo-voorraad laden…</p> : <>
      {page === 'stock' && <StockOverview data={data} room={room} setRoom={setRoom} book={book} scan={() => navigate('scan')} />}
      {page === 'scan' && <ScanAndBook data={data} room={room} setRoom={setRoom} initialProduct={startProduct} initialAction={action} back={() => navigate('stock')} />}
      {page === 'history' && <MovementHistory data={data} />}
      {page === 'settings' && <DemoSettings data={data} barcodes={() => navigate('barcodes')} />}
      {page === 'barcodes' && <DemoBarcodes data={data} back={() => navigate('settings')} />}
    </>}</main>
    <footer className="app-footer">Fictieve voorraad · 1 eenheid = 1 ongeopende verpakking · Opgeslagen in deze browser</footer>
  </>;
}
