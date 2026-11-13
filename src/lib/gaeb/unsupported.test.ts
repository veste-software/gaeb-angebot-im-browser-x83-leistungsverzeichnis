import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { detectUnsupported } from './unsupported';

const ok = readFileSync('tests/fixtures/gaeb/synthetic/v33-basic.X83', 'utf8');
const codes = (s: string) => detectUnsupported(s).map((u) => u.code);

describe('detectUnsupported', () => {
  it('accepts the supported fixture', () => expect(detectUnsupported(ok)).toEqual([]));
  it('flags GAEB 2000', () => expect(codes('#begin[GAEB]\n#end[GAEB]')).toEqual(['gaeb2000']));
  it('flags GAEB 90', () => expect(codes('00      83 1234\n01 ...')).toEqual(['gaeb90']));
  it('flags unknown namespace', () =>
    expect(codes('<GAEB xmlns="http://example.org/x"><a/></GAEB>')).toEqual(['namespace']));
  it('flags ÖNORM', () => expect(codes('<?xml version="1.0"?><LB-Standard xmlns="urn:oenorm"/>')).toEqual(['oenorm']));
  it('flags price components', () =>
    expect(codes(ok.replace('</Item>', '<UPComp1>x</UPComp1></Item>'))).toContain('upcomp'));
  it('flags more than one BoQ', () =>
    expect(codes(ok.replace('</Award>', '<BoQ ID="2"></BoQ></Award>'))).toContain('multi-boq'));
  it('messages are German and say what to do', () => {
    expect(detectUnsupported('#begin[GAEB]')[0].message).toMatch(/Kalkulationssoftware/);
  });
});
