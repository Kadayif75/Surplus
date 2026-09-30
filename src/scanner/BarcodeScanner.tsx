import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import type { Symbology } from '../domain/types';

const formats = [BarcodeFormat.CODE_128, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A];
export function cameraErrorMessage(error: unknown) {
  const name = typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'Cameratoegang is geweigerd. Controleer de toegestane browserinstellingen of voer de barcode handmatig in.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'Er is geen geschikte camera gevonden. Voer de barcode handmatig in of zoek het product.';
  if (name === 'NotReadableError' || name === 'AbortError') return 'De camera is bezet of kan niet starten. Sluit andere camera-apps en probeer opnieuw.';
  return 'De camera kan niet starten. Probeer opnieuw, voer de barcode handmatig in of zoek het product.';
}
export function BarcodeScanner({ onDetected }: { onDetected: (raw: string, format: Symbology) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | undefined>(undefined);
  const controls = useRef<IScannerControls | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const generation = useRef(0);
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('De camera start pas als je op Camera starten tikt.');
  const stop = useCallback(() => {
    generation.current++;
    clearTimeout(timer.current);
    controls.current?.stop(); controls.current = undefined;
    stream.current?.getTracks().forEach(track => track.stop()); stream.current = undefined;
    if (video.current) video.current.srcObject = null;
    setActive(false);
  }, []);
  useEffect(() => {
    const suspend = () => { if (document.hidden) { stop(); setMessage('Camera gestopt omdat de app op de achtergrond staat. Tik op Camera starten om verder te gaan.'); } };
    const pagehide = () => stop();
    document.addEventListener('visibilitychange', suspend);
    window.addEventListener('pagehide', pagehide);
    return () => { stop(); document.removeEventListener('visibilitychange', suspend); window.removeEventListener('pagehide', pagehide); };
  }, [stop]);
  async function start() {
    stop();
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setMessage('Camerascannen vereist HTTPS en een browser met cameratoegang. Gebruik hier handmatige invoer of product zoeken.'); return;
    }
    const session = generation.current;
    let found = false;
    setActive(true); setMessage('Richt de camera op één streepjescode. Houd de volledige code en de witte randen in beeld.');
    timer.current = setTimeout(() => { if (generation.current === session) { stop(); setMessage('Nog geen code herkend. Verander de afstand, houd de camera stil en controleer scherpte en licht. Ondersteund: Code 128, EAN-13, EAN-8 en UPC-A. Start opnieuw of voer de code handmatig in.'); } }, 20000);
    try {
      const camera = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (generation.current !== session || document.hidden) { camera.getTracks().forEach(t => t.stop()); return; }
      stream.current = camera;
      const reader = new BrowserMultiFormatReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, formats]]), { delayBetweenScanAttempts: 100 });
      const scannerControls = await reader.decodeFromStream(camera, video.current!, (result, _error, currentControls) => {
        if (!result || found || generation.current !== session) return;
        found = true;
        const format = BarcodeFormat[result.getBarcodeFormat()] as Symbology;
        const raw = result.getText();
        currentControls.stop(); stop();
        onDetected(raw, format);
      });
      if (generation.current !== session) scannerControls.stop();
      else controls.current = scannerControls;
    } catch (error) {
      if (generation.current !== session) return;
      stop(); setMessage(cameraErrorMessage(error));
    }
  }
  return <section className="scanner" aria-label="Camerascanner">
    <div className="video-frame"><video ref={video} playsInline muted autoPlay aria-label="Live camerabeeld voor streepjescodes" />{active ? <div className="scan-frame" aria-hidden="true" /> : <p className="video-hint">Scan een streepjescode op één verpakking</p>}</div>
    <p role="status">{message}</p>
    <button className={active ? 'secondary' : 'primary'} onClick={active ? () => { stop(); setMessage('Camera gestopt. Je kunt handmatig invoeren of opnieuw starten.'); } : start}>{active ? 'Camera stoppen' : 'Camera starten'}</button>
  </section>;
}
