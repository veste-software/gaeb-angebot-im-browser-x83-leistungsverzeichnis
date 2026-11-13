export interface Unsupported {
  code: 'gaeb90' | 'gaeb2000' | 'oenorm' | 'namespace' | 'upcomp' | 'multi-boq' | 'tm-list';
  message: string;
}

const NEXT =
  'Bitte bepreisen Sie dieses Verzeichnis in Ihrer Kalkulationssoftware oder fordern Sie die Datei als GAEB DA XML 3.1 bis 3.3 an.';

/** Finds features the tool cannot price safely. Returns an empty list when the file is fine. */
export function detectUnsupported(text: string): Unsupported[] {
  const t = text.replace(/^﻿/, '');
  const head = t.slice(0, 2000);
  const out: Unsupported[] = [];

  if (/^#begin\[/i.test(t.trimStart())) {
    return [{ code: 'gaeb2000', message: `Das ist eine GAEB-2000-Datei (P83). Dieses Format wird nicht unterstützt. ${NEXT}` }];
  }
  if (!/^\s*</.test(t)) {
    // GAEB 90: fixed-width text, records start with a two-digit record type such as "00".
    if (/^\d{2}/.test(t.trimStart())) {
      return [{ code: 'gaeb90', message: `Das ist eine GAEB-90-Datei (D83). Dieses Format wird nicht unterstützt. ${NEXT}` }];
    }
    return [];
  }
  if (/oenorm|önorm|LB-?Standard/i.test(head)) {
    return [{ code: 'oenorm', message: `Das ist eine ÖNORM-Datei. Dieses Format wird nicht unterstützt. ${NEXT}` }];
  }
  const ns = /<GAEB\b[^>]*?\sxmlns="([^"]*)"/.exec(t)?.[1];
  if (ns !== undefined && !/^http:\/\/www\.gaeb\.de\/GAEB_DA_XML\/DA8\d\/(3\.\d|200407)$/.test(ns)) {
    return [{ code: 'namespace', message: `Die Version dieser GAEB-Datei (${ns || 'ohne Namensraum'}) ist unbekannt. ${NEXT}` }];
  }
  if (/<(UPComp\d?|UPBkdn\d?)[\s>/]/.test(t)) {
    out.push({
      code: 'upcomp',
      message: `Die Datei verlangt eine Aufgliederung des Einheitspreises (Preisanteile). Das kann dieses Werkzeug nicht. ${NEXT}`,
    });
  }
  if ((t.match(/<BoQ[\s>]/g) ?? []).length > 1) {
    out.push({ code: 'multi-boq', message: `Die Datei enthält mehr als ein Leistungsverzeichnis. Das wird nicht unterstützt. ${NEXT}` });
  }
  if (/<(Hourly|TimeAndMaterial|StdLohn|DayWork)\b/i.test(t)) {
    out.push({ code: 'tm-list', message: `Die Datei enthält Stundenlohn- bzw. Regieleistungen. Das wird nicht unterstützt. ${NEXT}` });
  }
  return out;
}
