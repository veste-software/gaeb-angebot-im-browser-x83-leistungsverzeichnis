/**
 * The studio installs the owner's legal texts as HTML files in src/content/legal/. We show them
 * unchanged. File names are matched loosely (e.g. impressum.de.html, datenschutz-en.html,
 * privacy.en.html), so this keeps working whatever exact names the studio uses.
 * Never write or edit legal text here.
 */
const files = import.meta.glob('../content/legal/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export type LegalKind = 'impressum' | 'datenschutz';
export type LegalLang = 'de' | 'en';

const KIND_WORDS: Record<LegalKind, RegExp> = {
  impressum: /impressum|imprint|legal-notice/,
  datenschutz: /datenschutz|privacy/,
};

function langOf(name: string): LegalLang {
  return /(^|[._-])en([._-]|$)/.test(name) ? 'en' : 'de';
}

export function legalHtml(kind: LegalKind, lang: LegalLang = 'de'): string | null {
  for (const [path, html] of Object.entries(files)) {
    const name = path.split('/').pop()!.toLowerCase().replace(/\.html$/, '');
    if (KIND_WORDS[kind].test(name) && langOf(name) === lang) return html;
  }
  return null;
}
