import { AnyAction } from 'redux';
import { FeatureCollection, MultiPolygon, Point } from 'geojson';
import axios, { AxiosResponse } from 'axios';
import { ThunkDispatch } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';

import { Features, UserAddress } from '../types';

const creator = actionCreatorFactory('features');
export const fetchFeaturesAction = creator.async<
  Record<string, unknown>,
  Features,
  Error
>('fetch');

export const fetchFeatures = (address: UserAddress) => async (
  dispatch: ThunkDispatch<
    Record<string, unknown>,
    Record<string, unknown>,
    AnyAction
  >
): Promise<void> => {
  dispatch(fetchFeaturesAction.started({}));
  try {
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

    const res: AxiosResponse<
      FeatureCollection<MultiPolygon | Point>
    > = await axios.get(URL);
    dispatch(
      fetchFeaturesAction.done({
        params: {},
        result: { [address.id]: res.data },
      })
    );
  } catch (error) {
    dispatch(
      fetchFeaturesAction.failed({
        error,
        params: {},
      })
    );
  }
};
