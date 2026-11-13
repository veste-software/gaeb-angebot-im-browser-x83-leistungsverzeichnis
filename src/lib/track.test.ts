import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from './track';
import { itemCountBucket } from './trackBuckets';

afterEach(() => {
  delete (globalThis as { plausible?: unknown }).plausible;
});

describe('track', () => {
  it('is a no-op without window.plausible', () => {
    expect(() => track('lv_opened', { version: '3.3' })).not.toThrow();
  });
  it('forwards event and props when plausible exists', () => {
    const fn = vi.fn();
    (globalThis as { plausible?: unknown }).plausible = fn;
    track('checkout_started', { product: 'single' });
    expect(fn).toHaveBeenCalledWith('checkout_started', { props: { product: 'single' } });
  });
  it('swallows errors from plausible', () => {
    (globalThis as { plausible?: unknown }).plausible = () => { throw new Error('x'); };
    expect(() => track('unlock_ok')).not.toThrow();
  });
});

describe('itemCountBucket', () => {
  it('buckets counts', () => {
    expect(itemCountBucket(5)).toBe('1-20');
    expect(itemCountBucket(50)).toBe('21-100');
    expect(itemCountBucket(300)).toBe('101-500');
    expect(itemCountBucket(2000)).toBe('500+');
  });
});
