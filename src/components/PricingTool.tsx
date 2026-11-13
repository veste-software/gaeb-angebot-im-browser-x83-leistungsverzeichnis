import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Category, Item, Lv } from '../lib/gaeb/model';
import { GaebParseError, parseGaeb } from '../lib/gaeb/parse';
import { decodeGaeb } from '../lib/gaeb/decode';
import { detectUnsupported } from '../lib/gaeb/unsupported';
import { computeTotals, excludedReason, type Prices } from '../lib/gaeb/totals';
import { centsToInput, formatEUR, formatQty, parseGermanNumber, toCents } from '../lib/gaeb/number';
import { checkBid } from '../lib/gaeb/check';
import { emptyBidder, exportX84, x84FileName, type Bidder } from '../lib/gaeb/export84';
import { Stamp } from './Stamp';
import { fingerprint } from '../lib/gaeb/fingerprint';
import { clearAll, loadState, saveState } from '../lib/storage.browser';
import { restoredMessage } from '../lib/saved';
import { TOKEN_KEY } from '../lib/storage.browser';
import { startCheckout, type Product } from '../lib/unlock/checkout';
import { verifyToken } from '../lib/unlock/token';
import { track } from '../lib/track';
import { url } from '../lib/paths';
import { renderPrintTable } from '../lib/gaeb/print';
import { itemCountBucket, unsupportedCode } from '../lib/trackBuckets';

const PUBLIC_KEY = (import.meta.env.PUBLIC_UNLOCK_KEY as string | undefined) ?? '';

function readToken(): string {
  try { return localStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; }
}

type Phase = { name: 'empty' } | { name: 'reading'; file: string } | { name: 'error'; message: string; unsupported?: boolean } | { name: 'done' };

function toPrices(inputs: Record<string, string>): Prices {
  const out: Prices = {};
  for (const [id, v] of Object.entries(inputs)) {
    const n = parseGermanNumber(v);
    out[id] = n == null ? null : toCents(n);
  }
  return out;
}

export default function PricingTool({ readOnly = false }: { readOnly?: boolean }) {
  const [phase, setPhase] = useState<Phase>({ name: 'empty' });
  const [over, setOver] = useState(false);
  const [lv, setLv] = useState<Lv | null>(null);
  const [xml, setXml] = useState('');
  const [fileName, setFileName] = useState('');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [bidder, setBidder] = useState<Bidder>(emptyBidder);
  const [downloaded, setDownloaded] = useState(false);
  const [fp, setFp] = useState('');
  const [restored, setRestored] = useState('');
  const [dialog, setDialog] = useState(false);
  const [token, setToken] = useState('');
  const [valid, setValid] = useState(false);
  const [payMsg, setPayMsg] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [busy, setBusy] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const prices = useMemo(() => toPrices(inputs), [inputs]);
  const totals = useMemo(() => (lv ? computeTotals(lv, prices) : null), [lv, prices]);
  const check = useMemo(() => (lv ? checkBid(lv, prices, bidder) : null), [lv, prices, bidder]);

  async function open(file: File | undefined) {
    if (!file) return;
    setPhase({ name: 'reading', file: file.name });
    try {
      const text = decodeGaeb(await file.arrayBuffer());
      const blocked = detectUnsupported(text);
      if (blocked.length > 0) {
        track('lv_unsupported', { reason: unsupportedCode(blocked.map((b) => b.message)) });
        setPhase({ name: 'error', message: blocked.map((b) => b.message).join(' '), unsupported: true });
        return;
      }
      const parsed = parseGaeb(text);
      if (parsed.phase !== 83 && parsed.phase !== 84) {
        throw new GaebParseError('Diese Datei ist weder ein Leistungsverzeichnis (X83) noch ein Angebot (X84).');
      }
      if (parsed.items.length === 0) throw new GaebParseError('Die Datei enthält keine Positionen.');
      const start: Record<string, string> = {};
      for (const i of parsed.items) if (i.up != null) start[i.id] = centsToInput(i.up);
      const key = await fingerprint(parsed);
      const saved = await loadState(key);
      if (saved) {
        Object.assign(start, saved.inputs);
        setBidder({ ...emptyBidder, ...saved.bidder });
        setRestored(restoredMessage(saved.savedAt));
      } else {
        setRestored('');
      }
      setFp(key);
      setXml(text);
      setLv(parsed);
      setFileName(file.name);
      setInputs(start);
      setDownloaded(false);
      track('lv_opened', { version: parsed.version, items: itemCountBucket(parsed.items.length) });
      setPhase({ name: 'done' });
    } catch (e) {
      setPhase({ name: 'error', message: e instanceof GaebParseError ? e.message : 'Die Datei konnte nicht gelesen werden.' });
    }
  }

  function setEp(id: string, v: string) {
    setInputs((p) => ({ ...p, [id]: v }));
    setDownloaded(false);
  }

  function normalise(id: string) {
    const n = parseGermanNumber(inputs[id] ?? '');
    if (n != null) setEp(id, centsToInput(toCents(n)));
  }

  function nextEp(from: HTMLInputElement) {
    const all = Array.from(sheetRef.current?.querySelectorAll<HTMLInputElement>('input[data-ep]') ?? []);
    const after = all.slice(all.indexOf(from) + 1);
    (after.find((e) => e.value.trim() === '') ?? after[0])?.focus();
  }

  function focusItem(id: string) {
    const el = document.getElementById(`ep-${id}`) as HTMLInputElement | null;
    el?.scrollIntoView({ block: 'center' });
    el?.focus();
  }

  useEffect(() => { setToken(readToken()); }, []);

  useEffect(() => {
    if (!dialog) return;
    opener.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('button:not([disabled]), input')?.focus();
    return () => opener.current?.focus();
  }, [dialog]);

  function trapTab(e: KeyboardEvent) {
    if (e.key === 'Escape') { setDialog(false); return; }
    if (e.key !== 'Tab') return;
    const f = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input, a[href]') ?? []);
    if (f.length === 0) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  const fullyPriced = !!check && check.entries.every((e) => e.status !== 'blocking');
  useEffect(() => { if (fullyPriced && fp) track('lv_fully_priced'); }, [fullyPriced, fp]);

  function printSheet() {
    track('print_opened');
    window.print();
  }

  useEffect(() => {
    if (!token || !fp || !PUBLIC_KEY) { setValid(false); return; }
    let live = true;
    void verifyToken(token, PUBLIC_KEY, { fingerprint: fp, now: Math.floor(Date.now() / 1000) }).then((p) => { if (live) setValid(p !== null); });
    return () => { live = false; };
  }, [token, fp]);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('session_id');
    if (!id) return;
    void (async () => {
      try {
        const res = await fetch(`/api/unlock?session_id=${encodeURIComponent(id)}`);
        const body = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
        if (!res.ok || !body.token) { setPayMsg(body.error ?? 'Die Zahlung konnte nicht bestätigt werden.'); return; }
        localStorage.setItem(TOKEN_KEY, body.token);
        setToken(body.token);
        track('unlock_ok');
        setPayMsg('Zahlung bestätigt. Öffnen Sie Ihre Datei erneut; Ihre Preise werden wiederhergestellt.');
      } catch {
        setPayMsg('Die Freischaltung ist hier nicht erreichbar. Versuchen Sie es auf der Live-Seite erneut.');
      }
    })();
  }, []);

  async function buy(product: Product) {
    setBusy(true);
    setPayMsg('');
    try {
      track('checkout_started', { product });
      location.href = await startCheckout(product, fp);
    } catch (e) {
      setPayMsg(e instanceof TypeError ? 'Die Bezahlung ist hier nicht erreichbar (kein Server unter /api).' : (e as Error).message);
      setBusy(false);
    }
  }

  async function applyCode() {
    const c = codeInput.trim();
    if (!c) return;
    const p = PUBLIC_KEY && fp ? await verifyToken(c, PUBLIC_KEY, { fingerprint: fp, now: Math.floor(Date.now() / 1000) }) : null;
    if (!p) {
      setPayMsg('Dieser Code ist ungültig, abgelaufen oder gehört zu einem anderen Leistungsverzeichnis. Bitte prüfen Sie ihn auf Tippfehler.');
      return;
    }
    try { localStorage.setItem(TOKEN_KEY, c); } catch { /* ignore */ }
    setToken(c);
    setPayMsg('Code geprüft und gespeichert.');
  }

  function download() {
    if (!lv || !check?.canExport || !valid) return;
    const out = exportX84(xml, prices, bidder);
    const url = URL.createObjectURL(new Blob([out], { type: 'application/xml' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = x84FileName(fileName);
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setDialog(false);
    track('x84_exported');
  }

  useEffect(() => {
    if (!fp || !lv) return;
    const t = setTimeout(() => void saveState(fp, inputs, bidder), 400);
    return () => clearTimeout(t);
  }, [fp, lv, inputs, bidder]);

  async function wipe() {
    if (!window.confirm('Alle auf diesem Gerät gespeicherten Preise, Firmendaten und den Freischaltcode löschen?')) return;
    await clearAll();
    setInputs({});
    setBidder(emptyBidder);
    setRestored('');
  }

  function reset() {
    setPhase({ name: 'empty' });
    setLv(null);
    setInputs({});
  }

  const dropProps = {
    onDragOver: (e: DragEvent) => { e.preventDefault(); setOver(true); },
    onDragLeave: () => setOver(false),
    onDrop: (e: DragEvent) => { e.preventDefault(); setOver(false); void open(e.dataTransfer?.files?.[0]); },
  };

  if (phase.name === 'reading') {
    return <p class="working" role="status">Leistungsverzeichnis wird gelesen …</p>;
  }

  if (phase.name !== 'done' || !lv || !totals || !check) {
    return (
      <div>
        {phase.name === 'error' && (
          <div class="notice-error tool-error" role="alert">
            <h2 class="label">{phase.unsupported ? 'NICHT UNTERSTÜTZT' : 'Datei nicht lesbar'}</h2>
            <p>{phase.message}</p>
            <p class="muted">Wählen Sie eine .X83-Datei im Format GAEB DA XML 3.1 bis 3.3. Ältere Formate (D83, P83) werden nicht unterstützt.</p>
          </div>
        )}
        <div class={`dropzone${over ? ' is-over' : ''}`} {...dropProps}>
          <div class="dropzone__sheet" aria-hidden="true">
            <div class="dropzone__heads"><span>OZ</span><span>Text</span><span>Menge</span><span>EH</span><span>EP</span><span>GP</span></div>
            <div class="dropzone__row"><span></span><span></span><span></span><span></span><span></span><span></span></div>
            <div class="dropzone__row"><span></span><span></span><span></span><span></span><span></span><span></span></div>
            <div class="dropzone__row"><span></span><span></span><span></span><span></span><span></span><span></span></div>
          </div>
          <div class="dropzone__main">
          <label class="btn btn-primary btn-large" for="lv-file">X83-Datei auswählen</label>
          <input id="lv-file" class="visually-hidden" type="file" accept=".x83,.X83,.x84,.X84,.xml,.d83,.D83,.p83,.P83" onChange={(e) => void open((e.currentTarget as HTMLInputElement).files?.[0])} />
          <p class="dropzone__hint">
            <span class="dropzone__hint-mouse">oder die Datei hierher ziehen</span>
            <span class="dropzone__hint-touch">Datei aus „Downloads“ oder „Dateien“ wählen</span>
            <span class="dropzone__example">z. B. LV_Malerarbeiten.X83</span>
          </p>
          </div>
        </div>
        <div class="under-drop">
          <p class="privacy">Ihre Datei wird nur in diesem Browser verarbeitet und nicht hochgeladen.</p>
          <p class="price-line">Öffnen, bepreisen, drucken: kostenlos · X84-Datei: 19&nbsp;€ netto pro Angebot (<a href={url('preise')}>Preise</a>)</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('de-DE');
  const renderNode = (n: Category | Item): preact.ComponentChildren => {
    if (n.kind === 'cat') {
      return (
        <>
          <div class="lv-cat" role="heading" aria-level={3}>{n.oz} {n.label}</div>
          {n.children.map(renderNode)}
          <div class="lv-sum">
            <span class="text">Summe {n.oz}</span>
            <span class="gp">{formatEUR(totals.categories[n.id] ?? 0)}</span>
          </div>
        </>
      );
    }
    const gp = totals.gp[n.id];
    const why = excludedReason(n);
    const invalid = (inputs[n.id] ?? '').trim() !== '' && parseGermanNumber(inputs[n.id]) == null;
    const missing = prices[n.id] == null && !n.notAppl && !n.alternative;
    return (
      <div class={`lv-row${missing ? ' is-missing' : ''}`}>
        <span class="oz">{n.oz}</span>
        <span class="text">
          {n.shortText}
          {why && <span class="flag-excluded"> ({why})</span>}
          {n.longText && (
            <details>
              <summary>Langtext</summary>
              <p class="longtext">{n.longText}</p>
            </details>
          )}
        </span>
        <span class="qty">{formatQty(n.qty)}</span>
        <span class="unit">{n.qu}</span>
        <span class="ep">
          <input
            id={`ep-${n.id}`}
            data-ep
            class="fill-in fill-in--ep"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            aria-label={`Einheitspreis Position ${n.oz}`}
            aria-invalid={invalid}
            readOnly={readOnly}
            value={inputs[n.id] ?? ''}
            onInput={(e) => setEp(n.id, (e.currentTarget as HTMLInputElement).value)}
            onBlur={() => normalise(n.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); normalise(n.id); nextEp(e.currentTarget as HTMLInputElement); }
            }}
          />
        </span>
        <span class="gp">{gp == null ? '' : formatEUR(gp)}</span>
      </div>
    );
  };

  return (
    <div class="tool">
      <div class="tool__head">
        <div>
          <p class="label">{lv.owner || 'Leistungsverzeichnis'} · GAEB DA XML {lv.version} · {fileName}</p>
          <h2 class="tool__title">{lv.projectName || 'Ohne Projektname'}</h2>
        </div>
        <button type="button" class="btn btn-secondary" onClick={reset}>Andere Datei öffnen</button>
      </div>

      <div class="tool__grid">
        <div>
          <div class="sheet" ref={sheetRef}>
            <div class="lv" role="group" aria-label="Leistungsverzeichnis">
              <div class="lv-head" aria-hidden="true">
                <span class="oz">OZ</span><span class="text">Kurztext</span><span class="qty">Menge</span>
                <span class="unit">Einheit</span><span class="ep">EP</span><span class="gp">GP</span>
              </div>
              <div class="bars">{lv.nodes.map(renderNode)}</div>
            </div>
          </div>
          <div class="total">
            {check.canExport && <Stamp date={today} />}
            <div>
              <p class="total__label">Angebotssumme netto</p>
              <p class="total__value">{formatEUR(totals.net)}</p>
            </div>
          </div>
        </div>

        <aside class="tool__side" aria-label="Angebotsprüfung">
          <h2 class="label">Angebotsprüfung</h2>
          <ul class="checklist">
            {check.entries.slice(0, 12).map((e) => (
              <li key={e.key} class={e.status === 'done' ? 'is-done' : e.status === 'blocking' ? 'is-blocking' : ''}>
                {e.itemId ? <a href={`#ep-${e.itemId}`} onClick={(ev) => { ev.preventDefault(); focusItem(e.itemId!); }}>{e.text}</a> : <span>{e.text}</span>}
              </li>
            ))}
          </ul>
          {check.entries.length > 12 && <p class="muted">… und {check.entries.length - 12} weitere Hinweise</p>}

          {restored && <p role="status" class="muted">{restored}</p>}
          <button type="button" class="btn btn-secondary" onClick={printSheet}>Drucken / Als PDF speichern</button>
          {readOnly && (
            <p class="muted">Nur Ansicht: Diese Seite ändert nichts an der Datei und erzeugt keine neue X84.</p>
          )}
          {!readOnly && <>
          <h2 class="label bidder-title">Ihre Firma</h2>
          {(['firma', 'strasse', 'plz', 'ort'] as const).map((k) => (
            <div class="field" key={k}>
              <label for={`b-${k}`}>{{ firma: 'Firma', strasse: 'Straße und Nr.', plz: 'PLZ', ort: 'Ort' }[k]}</label>
              <input id={`b-${k}`} autoComplete={{ firma: 'organization', strasse: 'street-address', plz: 'postal-code', ort: 'address-level2' }[k]} value={bidder[k]} onInput={(e) => { setBidder({ ...bidder, [k]: (e.currentTarget as HTMLInputElement).value }); setDownloaded(false); }} />
            </div>
          ))}

          <button type="button" class="btn btn-primary btn-large" disabled={!check.canExport} onClick={() => setDialog(true)}>X84 erstellen – 19 € netto</button>
          {!check.canExport && <p class="muted">Der Export ist frei, sobald kein Punkt mit [!] mehr offen ist.</p>}
          <button type="button" class="btn btn-secondary" onClick={() => void wipe()}>Alles löschen</button>
          {dialog && (
            <dialog open ref={dialogRef} class="notice" aria-labelledby="pay-title" aria-modal="true" onKeyDown={trapTab}>
              <h2 id="pay-title" class="label">Zusammenfassung</h2>
              <p>{lv.items.length} Positionen, Angebotssumme netto {formatEUR(totals.net)}. Bitte die Angebotssumme mit Ihrem Angebotsschreiben abgleichen.</p>
              {valid ? (
                <>
                  <p>Ihr Freischaltcode (zum Kopieren): <code>{token}</code></p>
                  <button type="button" class="btn btn-primary" autofocus onClick={download}>X84 herunterladen</button>
                </>
              ) : (
                <>
                  <button type="button" class="btn btn-primary" disabled={busy} onClick={() => void buy('single')}>Einzelangebot 19 € netto</button>
                  <button type="button" class="btn btn-secondary" disabled={busy} onClick={() => void buy('year')}>Jahrespass 79 € netto</button>
                  <p class="muted">Preise zuzüglich Umsatzsteuer. Ihr Leistungsverzeichnis wird nicht übertragen.</p>
                  <div class="field">
                    <label for="code">Freischaltcode eingeben</label>
                    <input id="code" value={codeInput} onInput={(e) => setCodeInput((e.currentTarget as HTMLInputElement).value)} />
                  </div>
                  <button type="button" class="btn btn-secondary" onClick={applyCode}>Code prüfen</button>
                </>
              )}
              {payMsg && <p role="status">{payMsg}</p>}
              <button type="button" class="btn btn-secondary" onClick={() => setDialog(false)}>Schließen</button>
            </dialog>
          )}
          {!dialog && payMsg && <p role="status">{payMsg}</p>}
          {downloaded && <p role="status">Gespeichert als {x84FileName(fileName)}. Bitte die Angebotssumme mit Ihrem Angebotsschreiben abgleichen.</p>}
          </>}
        </aside>
        <div class="print-only" dangerouslySetInnerHTML={{ __html: renderPrintTable(lv, prices, bidder, today) }} />
      </div>
    </div>
  );
}
