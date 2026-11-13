const ISO_DATE_LENGTH = 10;
const FRACTIONAL_MONTH = 1.5;
const MAX_MONTHS = 12;

import { describe, it, expect } from 'vitest';
import {
  maxSecondaryMonths,
  permitEndDay,
  validSecondaryPurchase,
} from './permitRules';

const primary = {
  startTime: '2026-11-12T12:00:00+02:00',
  endTime: '2027-02-11T23:59:59+02:00',
  contractType: 'FIXED_PERIOD',
};

describe('secondary permit purchase dates', () => {
  it.each([
    ['2026-11-12T14:00:00+02:00', 3],
    ['2026-11-13T00:00:00+02:00', 2],
    ['2027-01-12T23:59:00+02:00', 1],
    ['2027-01-13T00:00:00+02:00', 0],
  ])('allows %s to buy %s full months', (start, months) => {
    expect(maxSecondaryMonths(primary, start, new Date(start))).toBe(months);
  });
  
  it('rejects backdating and earlier starts', () => {
    expect(
      validSecondaryPurchase(
        primary,
        primary.startTime,
        3,
        new Date('2026-11-13T12:00:00+02:00')
      )
    ).toBe(false);
    expect(
      validSecondaryPurchase(
        primary,
        '2026-11-12T11:00:00+02:00',
        1,
        new Date(primary.startTime)
      )
    ).toBe(false);
  });
  
  it('accounts for a later selected start', () => {
    expect(
      maxSecondaryMonths(
        primary,
        '2027-01-13T12:00:00+02:00',
        new Date(primary.startTime)
      )
    ).toBe(0);
  });
  
  it.each([
    ['2024-01-31T12:00:00+02:00', '2024-02-28'],
    ['2026-03-29T12:00:00+03:00', '2026-04-28'],
    ['2026-10-25T12:00:00+02:00', '2026-11-24'],
    ['2026-11-12T22:00:00Z', '2026-12-12'],
  ])('handles month ends and Helsinki calendar days: %s', (start, end) => {
    expect(permitEndDay(start, 1).toISOString().slice(0, ISO_DATE_LENGTH)).toBe(
      end
    );
  });
  
  it('rejects zero, negative, and fractional durations', () => {
    for (const months of [0, -1, FRACTIONAL_MONTH, NaN]) {
      expect(
        validSecondaryPurchase(
          primary,
          primary.startTime,
          months,
          new Date(primary.startTime)
        )
      ).toBe(false);
    }
  });
  
  it('does not cap a subscription at its renewal date', () => {
    expect(
      maxSecondaryMonths(
        { ...primary, contractType: 'OPEN_ENDED' },
        primary.startTime,
        new Date(primary.startTime)
      )
    ).toBe(MAX_MONTHS);
    expect(
      maxSecondaryMonths(
        {
          ...primary,
          contractType: 'OPEN_ENDED',
          endType: 'AFTER_CURRENT_PERIOD',
        },
        primary.startTime,
        new Date(primary.startTime)
      )
    ).toBe(3);
  });
});
