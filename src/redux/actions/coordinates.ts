import { AnyAction } from 'redux';
import { FeatureCollection, Point, Position } from 'geojson';
import axios, { AxiosResponse } from 'axios';
import { ThunkDispatch } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';
import { first, get } from 'lodash';

import { Coordinates, UserAddress } from '../types';
import { fetchZone } from './zone';

const creator = actionCreatorFactory('coordinates');
export const fetchCoordinatesAction = creator.async<
  Record<string, unknown>,
  Coordinates,
  Error
>('fetch');

export const fetchCoordinates = (address: UserAddress) => async (
  dispatch: ThunkDispatch<
    Record<string, unknown>,
    Record<string, unknown>,
    AnyAction
  >
): Promise<void> => {
  dispatch(fetchCoordinatesAction.started({}));
  try {
    const URL = `
    https://kartta.hel.fi/ws/geoserver/avoindata/wfs?
    SERVICE=WFS&VERSION=1.1.0
    &REQUEST=GetFeature
    &TYPENAME=avoindata:Helsinki_osoiteluettelo
    &CQL_FILTER=(
       katunimi='${address.address.split(' ')[0]}' AND
       osoitenumero='${address.address.split(' ')[1]}' AND
       postinumero='${address.postalCode}')
    &OUTPUTFORMAT=json
    &srsName=EPSG:4326
    `;

    const res: AxiosResponse<FeatureCollection<Point>> = await axios.get(URL);
    const coordinates: Position = get(
      first(res.data.features),
      'geometry.coordinates'
    );
    if (coordinates?.length) {
      dispatch(fetchZone(coordinates));
    }
    dispatch(
      fetchCoordinatesAction.done({
        params: {},
        result: { [address.id]: coordinates },
      })
    );
  } catch (error) {
    dispatch(
      fetchCoordinatesAction.failed({
        error,
        params: {},
      })
    );
  }
};
