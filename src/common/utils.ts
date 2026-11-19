import { extractIBAN } from 'ibantools';
import { UserAddress, Vehicle, MaybeDate } from '../types';
import { normalizeDateValue } from '../utils';

export const getLocalizedAddress = (address: UserAddress, lang: string) => {
  const { streetName, streetNameSv, city, citySv } = address;
  // DVV often has no Swedish names, so fall back to the Finnish ones
  return lang === 'sv'
    ? { street: streetNameSv || streetName, city: citySv || city }
    : { street: streetName, city };
};

export const formatAddress = (
  address: UserAddress,
  addressApartment: string,
  lang: string
): string => {
  const { postalCode, streetNumber } = address;
  const { street, city } = getLocalizedAddress(address, lang);
  return `${street} ${streetNumber} ${addressApartment}, ${postalCode} ${city}`;
};

export function formatDateDisplay(datetime: MaybeDate): string {
  return normalizeDateValue(datetime).toLocaleDateString('fi');
}

export function formatVehicle(vehicle: Vehicle): string {
  const { manufacturer, model, registrationNumber } = vehicle;
  return `${registrationNumber} ${manufacturer} ${model}`;
}

export function isValidIBAN(value: string): boolean {
  const iban = extractIBAN(value);
  return iban.valid && iban.countryCode === 'FI';
}
