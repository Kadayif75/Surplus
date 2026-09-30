import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import type { BarcodeMapping, InventorySnapshot } from '../domain/types';
function Barcode({ mapping }: { mapping: BarcodeMapping }) {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => { JsBarcode(svg.current!, mapping.rawValue, { format: mapping.symbology === 'CODE_128' ? 'CODE128' : 'EAN13', width: 2, height: 65, margin: 24, fontSize: 17, background: '#ffffff', lineColor: '#000000' }); }, [mapping]);
  return <svg ref={svg} role="img" aria-label={`${mapping.symbology} barcode ${mapping.rawValue}`} />;
}
export function DemoBarcodes({ data, back }: { data: InventorySnapshot; back: () => void }) {
  return <><div className="page-heading"><div><p className="eyebrow">Alleen voor de proef</p><h1>Demobarcodes</h1><p>DEMO, geen officiële productbarcode</p></div><div className="actions no-print"><button onClick={back}>Terug</button><button className="primary" onClick={() => window.print()}>Barcodes afdrukken</button></div></div><p className="print-instructions no-print">Print op 100% met witte randen, of scan vanaf een tweede scherm. Eén code staat voor één verpakking. Deze pagina verandert geen voorraad.</p><div className="barcode-grid">{data.mappings.filter(m => m.isDemo).map(m => <article className="barcode-card" key={m.id}><strong>{data.products.find(p => p.id === m.productId)?.name}</strong><p>Artikel {data.products.find(p => p.id === m.productId)?.tenaArticleNumber} · 1 verpakking</p><Barcode mapping={m} /><p>{m.symbology.replace('_', '-')} · DEMO, geen officiële productbarcode</p></article>)}</div></>;
}
