import { FeatureCollection, MultiPolygon, Position } from 'geojson';

export type Zone = {
  id: string;
  name: string;
  price: number;
  description: string;
  descriptionSv: string;
  location: FeatureCollection<MultiPolygon>;
};

export type UserAddress = {
  id: string;
  streetName: string;
  streetNameSv: string;
  streetNumber: number;
  city: string;
  citySv: string;
  postalCode: string;
  location?: Position;
  zone?: Zone;
  primary: boolean;
};

export type UserProfile = {
  id: string;
  age: number;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  phoneNumber: string;
  primaryAddress: UserAddress;
  primaryAddressApartment: string;
  primaryAddressApartmentSv: string;
  otherAddress: UserAddress;
  otherAddressApartment: string;
  otherAddressApartmentSv: string;
  token: string;
};
