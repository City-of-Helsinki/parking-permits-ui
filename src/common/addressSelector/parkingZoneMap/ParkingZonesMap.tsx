import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FeatureCollection, GeoJsonObject, MultiPolygon } from 'geojson';
import L, { LatLngExpression } from 'leaflet';
import { useTranslation } from 'react-i18next';
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

const flipLocation = (location: number[]): LatLngExpression => ({
  lat: location[1],
  lng: location[0],
});

const getMultiPolygon = (location: FeatureCollection<MultiPolygon>) => ({
  type: 'MultiPolygon',
  coordinates: location,
});

export default function ParkingZonesMap({
  userAddress,
  zoom,
}: Props): React.ReactElement {
  const { t, i18n } = useTranslation();
  const center = userAddress.location as LatLngExpression;
  const attribution = 'map.attribution.helsinki';
  const getURL = (lang: string) => {
    const suffix = lang === 'sv' ? '@sv' : '';
    return `https://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}${suffix}.png`;
  };
  return (
    <MapContainer
      center={flipLocation(center as number[])}
      zoom={zoom}
      attributionControl>
      {i18n.language === 'sv' && (
        <TileLayer attribution={t(attribution)} url={getURL(i18n.language)} />
      )}
      {i18n.language !== 'sv' && (
        <TileLayer attribution={t(attribution)} url={getURL(i18n.language)} />
      )}
      <Marker position={flipLocation(center as number[])} icon={icon}>
        <Popup>{`${userAddress.zone?.name} ( ${userAddress.zone?.description} )`}</Popup>
      </Marker>
      <GeoJSON
        key={uuidv4()}
        data={
          getMultiPolygon(
            userAddress.zone?.location as FeatureCollection<MultiPolygon>
          ) as GeoJsonObject
        }
        pathOptions={{ fillColor: '#fd9a99', fillOpacity: 0.6 }}
      />
    </MapContainer>
  );
}
