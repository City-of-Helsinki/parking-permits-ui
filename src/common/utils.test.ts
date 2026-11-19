import { UserAddress } from '../types';
import { formatAddress, getLocalizedAddress } from './utils';

const address = {
  streetName: 'Mannerheimintie',
  streetNameSv: 'Mannerheimvägen',
  streetNumber: 1,
  city: 'HELSINKI',
  citySv: 'HELSINGFORS',
  postalCode: '00100',
} as UserAddress;

const withoutSwedish = (missing: undefined | null | string) =>
  ({
    ...address,
    streetNameSv: missing,
    citySv: missing,
  } as unknown as UserAddress);

describe('getLocalizedAddress', () => {
  it('returns Finnish names for fi', () => {
    expect(getLocalizedAddress(address, 'fi')).toEqual({
      street: 'Mannerheimintie',
      city: 'HELSINKI',
    });
  });

  it('returns Swedish names for sv', () => {
    expect(getLocalizedAddress(address, 'sv')).toEqual({
      street: 'Mannerheimvägen',
      city: 'HELSINGFORS',
    });
  });

  it.each([undefined, null, ''])(
    'falls back to Finnish names when the Swedish ones are %j',
    missing => {
      expect(getLocalizedAddress(withoutSwedish(missing), 'sv')).toEqual({
        street: 'Mannerheimintie',
        city: 'HELSINKI',
      });
    }
  );
});

describe('formatAddress', () => {
  it('formats a Finnish address', () => {
    expect(formatAddress(address, 'A 6', 'fi')).toBe(
      'Mannerheimintie 1 A 6, 00100 HELSINKI'
    );
  });

  it('formats a Swedish address', () => {
    expect(formatAddress(address, 'A 6', 'sv')).toBe(
      'Mannerheimvägen 1 A 6, 00100 HELSINGFORS'
    );
  });

  it('formats a Swedish address with the Finnish fallback', () => {
    expect(formatAddress(withoutSwedish(''), 'A 6', 'sv')).toBe(
      'Mannerheimintie 1 A 6, 00100 HELSINKI'
    );
  });
});
