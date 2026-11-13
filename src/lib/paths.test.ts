import { describe, expect, it } from 'vitest';
import { joinBase } from './paths';

describe('joinBase', () => {
  it('keeps root paths at /', () => {
    expect(joinBase('/', '')).toBe('/');
    expect(joinBase('/', 'preise')).toBe('/preise');
    expect(joinBase('/', '/preise')).toBe('/preise');
  });

  it('prefixes the sub-path used by the Pages preview', () => {
    expect(joinBase('/preview', 'preise')).toBe('/preview/preise');
    expect(joinBase('/preview/', '/favicon.svg')).toBe('/preview/favicon.svg');
    expect(joinBase('/preview', '')).toBe('/preview/');
  });
});
