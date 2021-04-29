import { AnyAction } from 'redux';
import { FeatureCollection, MultiPolygon, Position } from 'geojson';
import axios, { AxiosResponse } from 'axios';
import { ThunkDispatch } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';

import { Zones } from '../types';

const creator = actionCreatorFactory('zones');
export const fetchZoneAction = creator.async<
  Record<string, unknown>,
  Zones,
  Error
>('fetch');

export const fetchZone = (position: Position) => async (
  dispatch: ThunkDispatch<
    Record<string, unknown>,
    Record<string, unknown>,
    AnyAction
  >
): Promise<void> => {
  dispatch(fetchZoneAction.started({}));
  try {
    const URL = `
    https://kartta.hel.fi/ws/geoserver/avoindata/wfs?
    SERVICE=WFS
    &VERSION=2.0.0
    &REQUEST=GetFeature
    &TYPENAME=avoindata:Asukas_ja_yrityspysakointivyohykkeet_alue
    &OUTPUTFORMAT=json
    &srsName=EPSG:4326
    &bbox=${[...position, ...position].join(',')}
    `;

    const res: AxiosResponse<FeatureCollection<MultiPolygon>> = await axios.get(
      URL
    );
    dispatch(
      fetchZoneAction.done({
        params: {},
        result: { [position.join('-')]: res.data },
      })
    );
  } catch (error) {
    dispatch(
      fetchZoneAction.failed({
        error,
        params: {},
      })
    );
  }
};
