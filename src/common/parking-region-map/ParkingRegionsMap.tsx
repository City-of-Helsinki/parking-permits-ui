import React from 'react';
import { TileLayer, MapContainer, GeoJSON, ScaleControl } from 'react-leaflet';
import { Container } from 'reactstrap';
// eslint-disable-next-line import/no-namespace
import * as geojson from 'geojson';

import './ParkingRegionsMap.css';
import { Region, Point } from '../types';

export interface Props {
  center: Point;
  zoom: number;
  regions?: Region[];
}

function getFeatureCollection(regions: Region[]): RegionCollection {
  return { type: 'FeatureCollection', features: regions };
}

export default function ParkingRegionsMap(props: Props): React.ReactElement {
  const geoJsonElement = props.regions ? (
    <GeoJSON key="id" data={getFeatureCollection(props.regions)} />
  ) : null;
  const osmAttribution =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
  return (
    <Container>
      <MapContainer center={props.center} zoom={props.zoom}>
        <TileLayer
          attribution={osmAttribution}
          url="//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ScaleControl metric imperial={false} maxWidth={150} />
        {geoJsonElement}
      </MapContainer>
    </Container>
  );
}

interface RegionCollection
  extends geojson.FeatureCollection<geojson.MultiPolygon> {
  features: Array<Region>;
}
