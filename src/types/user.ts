import { FeatureCollection, MultiPolygon, Position } from 'geojson';

export type Zone = {
  id: string;
  name: string;
  price: number;
  sharedProductId: string;
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
  otherAddress: UserAddress;
  token: string;
};
