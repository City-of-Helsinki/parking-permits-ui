import { extractIBAN } from 'ibantools';
import { UserAddress, Vehicle, MaybeDate } from '../types';
import { normalizeDateValue } from '../utils';

export const formatAddress = (
  address: UserAddress,
  addressApartment: string,
  lang: string
): string => {
  const { streetName, streetNameSv, city, citySv, postalCode, streetNumber } =
    address;
  const addressStreet = lang === 'sv' ? streetNameSv : streetName;
  const addressCity = lang === 'sv' ? citySv : city;
  return `${addressStreet} ${streetNumber} ${addressApartment}, ${postalCode} ${addressCity}`;
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
