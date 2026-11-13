/** The "ANGEBOT GEPRÜFT" stamp: shown only when nothing blocks the export. */
export function Stamp({ date }: { date: string }) {
  return (
    <svg class="stamp" viewBox="0 0 132 132" width="132" height="132" role="img" aria-label={`Stempel: Angebot geprüft am ${date}`}>
      <defs>
        <path id="stamp-ring" d="M66 66 m-48 0 a48 48 0 1 1 96 0 a48 48 0 1 1 -96 0" />
      </defs>
      <circle cx="66" cy="66" r="60" fill="none" stroke="currentColor" stroke-width="3" />
      <circle cx="66" cy="66" r="36" fill="none" stroke="currentColor" stroke-width="1.5" />
      <text font-family="'Courier Prime', 'Courier New', monospace" font-weight="700" font-size="12" letter-spacing="2" fill="currentColor">
        <textPath href="#stamp-ring" startOffset="2">ANGEBOT GEPRÜFT ★ ANGEBOT GEPRÜFT ★</textPath>
      </text>
      <text x="66" y="70" text-anchor="middle" font-family="'Courier Prime', 'Courier New', monospace" font-weight="700" font-size="11" fill="currentColor">
        {date}
      </text>
    </svg>
  );
}
