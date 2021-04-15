import * as geojson from 'geojson';

export type Point = [number, number];

export interface Region extends geojson.Feature<geojson.MultiPolygon> {
  id: string;
}
