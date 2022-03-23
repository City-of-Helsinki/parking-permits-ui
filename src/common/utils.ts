import { extractIBAN } from 'ibantools';
import { UserAddress, Vehicle } from '../types';

export const formatAddress = (address: UserAddress, lang: string): string => {
  const { streetName, streetNameSv, city, citySv, postalCode, streetNumber } =
    address;
  const addressStreet = lang === 'sv' ? streetNameSv : streetName;
  const addressCity = lang === 'sv' ? citySv : city;
  return `${addressStreet} ${streetNumber}, ${postalCode} ${addressCity}`;
};

export function formatDateDisplay(datetime: string | Date): string {
  const dt = typeof datetime === 'string' ? new Date(datetime) : datetime;
  return dt.toLocaleDateString('fi');
}

export function formatMonthlyPrice(price: number): string {
  const formattedPrice = parseFloat(price.toFixed(2));
  return `${formattedPrice} €/kk`;
}

export function formatVehicle(vehicle: Vehicle): string {
  const { manufacturer, model, registrationNumber } = vehicle;
  return `${registrationNumber} ${manufacturer} ${model}`;
}

export function isValidIBAN(value: string): boolean {
  const iban = extractIBAN(value);
  return iban.valid && iban.countryCode === 'FI';
}
