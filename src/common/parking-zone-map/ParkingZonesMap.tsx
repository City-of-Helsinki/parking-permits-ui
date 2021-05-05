import React from 'react';
import { TileLayer, MapContainer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { Feature, FeatureCollection, MultiPolygon, Point } from 'geojson';
import L, { LatLngExpression } from 'leaflet';

import marker from '../../assets/images/icon_poi_talo-sininen.svg';

import './ParkingZonesMap.css';

const icon = new L.Icon({
  iconUrl: marker,
  // eslint-disable-next-line no-magic-numbers
  iconAnchor: [5, 55],
  // eslint-disable-next-line no-magic-numbers
  iconSize: [25, 55],
});

export interface Props {
  zoom: number;
  featureCollection: FeatureCollection<MultiPolygon | Point>;
}

const getMapCenter = (
  featureCollection: FeatureCollection<MultiPolygon | Point>
) => {
  const pointFeature = JSON.parse(
    JSON.stringify(featureCollection)
  ).features.find((feature: Feature) => feature.geometry.type === 'Point');
  return pointFeature?.geometry.coordinates.reverse() as LatLngExpression;
};

const getOnlyZones = (
  featureCollection: FeatureCollection<MultiPolygon | Point>
): FeatureCollection<MultiPolygon> => {
  const copyOfCollection = JSON.parse(JSON.stringify(featureCollection));
  copyOfCollection.features = copyOfCollection.features.filter(
    (feature: Feature) => feature.geometry.type !== 'Point'
  );
  return copyOfCollection;
};

export default function ParkingZonesMap(props: Props): React.ReactElement {
  const center = getMapCenter(props.featureCollection);
  const osmAttribution =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
  return (
    <MapContainer center={center} zoom={props.zoom}>
      <TileLayer
        attribution={osmAttribution}
        url="//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={icon}>
        <Popup>
          <span>
            A pretty CSS3 popup. <br /> Easily customizable.
          </span>
        </Popup>
      </Marker>
      <GeoJSON key="id" data={getOnlyZones(props.featureCollection)} />
    </MapContainer>
  );
}
