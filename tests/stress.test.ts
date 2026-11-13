import { describe, expect, it } from 'vitest';
import { exportX84 } from '../src/lib/gaeb/export84';
import { parseGaeb } from '../src/lib/gaeb/parse';

function bigLv(n: number): string {
  let items = '';
  for (let i = 1; i <= n; i++) {
    items += `<Item ID="I${i}" RNoPart="${String(i).padStart(4, '0')}"><Qty>${i}.500</Qty><QU>m</QU><Description><CompleteText><OutlineText><OutlTxt><TextOutlTxt><span>Position ${i}</span></TextOutlTxt></OutlTxt></OutlineText></CompleteText></Description></Item>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?><!-- SYNTHETIC stress file --><GAEB xmlns="http://www.gaeb.de/GAEB_DA_XML/DA83/3.3"><GAEBInfo><Version>3.3</Version></GAEBInfo><PrjInfo><NamePrj>Stress</NamePrj></PrjInfo><Award><DP>83</DP><BoQ ID="B"><BoQInfo><BoQBkdn><Type>BoQLevel</Type><Length>2</Length></BoQBkdn><BoQBkdn><Type>Item</Type><Length>4</Length></BoQBkdn></BoQInfo><BoQBody><BoQCtgy ID="C" RNoPart="01"><LblTx><p><span>Alles</span></p></LblTx><BoQBody><Itemlist>${items}</Itemlist></BoQBody></BoQCtgy></BoQBody></BoQ></Award></GAEB>`;
}

describe('2,000 items (K3)', () => {
  const xml = bigLv(2000);
  it('parses in under one second', () => {
    const t = performance.now();
    const lv = parseGaeb(xml);
    expect(lv.items).toHaveLength(2000);
    expect(performance.now() - t).toBeLessThan(1000);
  });
  it('exports in a reasonable time', () => {
    const lv = parseGaeb(xml);
    const prices = Object.fromEntries(lv.items.map((i) => [i.id, 100]));
    const t = performance.now();
    const out = exportX84(xml, prices, { firma: 'A', strasse: 'B', plz: '1', ort: 'C' });
    expect(parseGaeb(out).items).toHaveLength(2000);
    expect(performance.now() - t).toBeLessThan(5000);
  });
});
