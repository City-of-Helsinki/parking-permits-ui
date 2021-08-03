import { v4 as uuidv4 } from 'uuid';
import { loader } from 'graphql.macro';
import axios, { AxiosResponse } from 'axios';
import { ApolloQueryResult } from '@apollo/client/core/types';

import {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Point,
  Position,
} from 'geojson';
import {
  ParkingDurationType,
  ParkingStartType,
  Permit,
  ProfileQueryResult,
  UserAddress,
  UserProfile,
} from '../types';
import { convertQueryToData } from '../utils';
import { GraphQLClient } from '../../graphql/graphqlClient';

export async function getFeatures(address: UserAddress): Promise<UserAddress> {
  const URL = `
    https://kartta.hel.fi/ws/geoserver/avoindata/wfs?
    SERVICE=WFS
    &VERSION=2.0.0
    &REQUEST=GetFeature
    &TYPENAME=
      avoindata:Asukas_ja_yrityspysakointivyohykkeet_alue,
      avoindata:Helsinki_osoiteluettelo
    &OUTPUTFORMAT=json
    &srsName=EPSG:4326
    &CQL_FILTER=CONTAINS(
      geom,querySingle(
        'avoindata:Helsinki_osoiteluettelo',
        'geom',
        'katunimi=''${address.address.split(' ')[0]}'' AND
         osoitenumero=''${address.address.split(' ')[1]}'''
      )
    )
    `;

  const res: AxiosResponse<FeatureCollection<MultiPolygon | Point>> =
    await axios.get(URL);
  const zoneFeatureCollection = (res.data?.features || []).find(
    feature => feature.geometry.type === 'MultiPolygon'
  );

  return {
    ...address,
    coordinates: (res.data?.features || [])
      .find(feature => feature.geometry.type === 'Point')
      ?.geometry?.coordinates?.reverse() as Position,
    zone: zoneFeatureCollection?.properties?.asukaspysakointitunnus,
    zoneName: zoneFeatureCollection?.properties?.alueen_nimi,
    zoneFeatureCollection: {
      type: 'FeatureCollection',
      features: [zoneFeatureCollection] as Feature<MultiPolygon>[],
    },
  };
}

export const getUserProfile = async (
  client: GraphQLClient
): Promise<UserProfile | null> => {
  const MY_PROFILE_QUERY = loader('../../graphql/myProfileQuery.graphql');
  const result: ApolloQueryResult<ProfileQueryResult> = await client.query({
    errorPolicy: 'all',
    query: MY_PROFILE_QUERY,
  });
  const data = convertQueryToData(result);
  if (!data) return null;
  data.addresses = await Promise.all(
    (data.addresses || []).map(async address => getFeatures(address))
  );
  return data;
};

export const getPermit = (reg: string, toyota?: boolean): Permit => ({
  vehicle: {
    id: uuidv4(),
    type: 'B1',
    manufacturer: toyota ? 'Toyota' : 'Skoda',
    model: toyota ? 'CH-R' : 'Octavia',
    // eslint-disable-next-line no-magic-numbers
    productionYear: toyota ? 2018 : 2020,
    registrationNumber: reg,
    // eslint-disable-next-line no-magic-numbers
    emission: toyota ? 85 : 110,
    primary: !!toyota,
  },
  prices: {
    // eslint-disable-next-line no-magic-numbers
    original: 30,
    // eslint-disable-next-line no-magic-numbers
    offer: 15,
    currency: '€',
  },
  durationType: ParkingDurationType.OPEN_ENDED,
  startType: ParkingStartType.IMMEDIATELY,
  startDate: new Date(),
  duration: 1,
});
