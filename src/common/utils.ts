import { UserAddress } from '../redux/types';

// eslint-disable-next-line import/prefer-default-export
export const formatAddress = (address: UserAddress, lang: string): string => {
  const { streetName, streetNameSv, city, citySv, postalCode } = address;
  const addressStreet = lang === 'sv' ? streetNameSv : streetName;
  const addressCity = lang === 'sv' ? citySv : city;
  return `${addressStreet}, ${postalCode} ${addressCity}`;
};
