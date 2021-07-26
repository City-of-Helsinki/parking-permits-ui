import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GeoJsonObject } from 'geojson';
import L, { LatLngExpression } from 'leaflet';
import { TileLayer, MapContainer, GeoJSON, Marker, Popup } from 'react-leaflet';

import './parkingZonesMap.css';

import { UserAddress } from '../../../redux';
import marker from '../../../assets/images/icon_poi_talo-sininen.svg';

const icon = new L.Icon({
  iconUrl: marker,
  // eslint-disable-next-line no-magic-numbers
  iconAnchor: [5, 55],
  // eslint-disable-next-line no-magic-numbers
  iconSize: [25, 55],
});

export interface Props {
  zoom: number;
  userAddress: UserAddress;
}

export default function ParkingZonesMap({
  userAddress,
  zoom,
}: Props): React.ReactElement {
  const center = userAddress.coordinates as LatLngExpression;
  const osmAttribution =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
  return (
    <MapContainer center={center} zoom={zoom}>
      <TileLayer
        attribution={osmAttribution}
        url="//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={icon}>
        <Popup>{`${userAddress.zoneName} ( ${userAddress.zone} )`}</Popup>
      </Marker>
      <GeoJSON
        key={uuidv4()}
        data={userAddress.zoneFeatureCollection as GeoJsonObject}
        pathOptions={{ fillColor: '#fd9a99', fillOpacity: 0.6 }}
      />
    </MapContainer>
  );
}
