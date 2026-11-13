import { useMemo, useRef, useState } from 'preact/hooks';
import type { Category, Item, Lv } from '../lib/gaeb/model';
import { GaebParseError, parseGaeb } from '../lib/gaeb/parse';
import { detectUnsupported } from '../lib/gaeb/unsupported';
import { computeTotals, excludedReason, type Prices } from '../lib/gaeb/totals';
import { centsToInput, formatEUR, formatQty, parseGermanNumber, toCents } from '../lib/gaeb/number';
import { checkBid } from '../lib/gaeb/check';
import { emptyBidder, exportX84, x84FileName, type Bidder } from '../lib/gaeb/export84';
import { Stamp } from './Stamp';

type Phase = { name: 'empty' } | { name: 'reading'; file: string } | { name: 'error'; message: string; unsupported?: boolean } | { name: 'done' };

function toPrices(inputs: Record<string, string>): Prices {
  const out: Prices = {};
  for (const [id, v] of Object.entries(inputs)) {
    const n = parseGermanNumber(v);
    out[id] = n == null ? null : toCents(n);
  }
  return out;
}

export default function PricingTool() {
  const [phase, setPhase] = useState<Phase>({ name: 'empty' });
  const [over, setOver] = useState(false);
  const [lv, setLv] = useState<Lv | null>(null);
  const [xml, setXml] = useState('');
  const [fileName, setFileName] = useState('');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [bidder, setBidder] = useState<Bidder>(emptyBidder);
  const [downloaded, setDownloaded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const prices = useMemo(() => toPrices(inputs), [inputs]);
  const totals = useMemo(() => (lv ? computeTotals(lv, prices) : null), [lv, prices]);
  const check = useMemo(() => (lv ? checkBid(lv, prices, bidder) : null), [lv, prices, bidder]);

  async function open(file: File | undefined) {
    if (!file) return;
    setPhase({ name: 'reading', file: file.name });
    try {
      const text = await file.text();
      const blocked = detectUnsupported(text);
      if (blocked.length > 0) {
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
      setXml(text);
      setLv(parsed);
      setFileName(file.name);
      setInputs(start);
      setDownloaded(false);
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

  function download() {
    if (!lv || !check?.canExport) return;
    const out = exportX84(xml, prices, bidder);
    const url = URL.createObjectURL(new Blob([out], { type: 'application/xml' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = x84FileName(fileName);
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
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
          <p class="dropzone__heads" aria-hidden="true">OZ TEXT MENGE EH EP GP</p>
          <label class="btn btn-primary btn-large" for="lv-file">X83-Datei auswählen</label>
          <input id="lv-file" class="visually-hidden" type="file" accept=".x83,.X83,.x84,.X84,.xml,.d83,.D83,.p83,.P83" onChange={(e) => void open((e.currentTarget as HTMLInputElement).files?.[0])} />
          <p class="dropzone__hint">
            oder .X83-Datei hierher ziehen
            <span class="dropzone__example">z. B. Leistungsverzeichnis_Malerarbeiten.X83</span>
          </p>
        </div>
        <p class="privacy">Ihre Datei wird nur in diesem Browser verarbeitet und nicht hochgeladen.</p>
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

          <h2 class="label bidder-title">Ihre Firma</h2>
          {(['firma', 'strasse', 'plz', 'ort'] as const).map((k) => (
            <div class="field" key={k}>
              <label for={`b-${k}`}>{{ firma: 'Firma', strasse: 'Straße und Nr.', plz: 'PLZ', ort: 'Ort' }[k]}</label>
              <input id={`b-${k}`} autoComplete={{ firma: 'organization', strasse: 'street-address', plz: 'postal-code', ort: 'address-level2' }[k]} value={bidder[k]} onInput={(e) => { setBidder({ ...bidder, [k]: (e.currentTarget as HTMLInputElement).value }); setDownloaded(false); }} />
            </div>
          ))}

          <button type="button" class="btn btn-primary btn-large" disabled={!check.canExport} onClick={download}>X84 erstellen</button>
          {!check.canExport && <p class="muted">Der Export ist frei, sobald kein Punkt mit [!] mehr offen ist.</p>}
          {downloaded && <p role="status">Gespeichert als {x84FileName(fileName)}. Bitte die Angebotssumme mit Ihrem Angebotsschreiben abgleichen.</p>}
        </aside>
      </div>
    </div>
  );
}
