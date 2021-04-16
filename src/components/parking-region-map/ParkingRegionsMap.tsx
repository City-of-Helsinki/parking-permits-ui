import { TileLayer, MapContainer, GeoJSON, ScaleControl } from 'react-leaflet';
import { Container } from 'reactstrap';
import * as geojson from 'geojson';

import './ParkingRegionsMap.css';
import { Region, Point } from '../../models/map';

export interface Props {
  center: Point;
  zoom: number;
  regions?: Region[];
}

export default function ParkingRegionsMap(props: Props) {
  const geoJsonElement = props.regions ? <GeoJSON key="id" data={getFeatureCollection(props.regions)} /> : null;
  const osmAttribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
  return (
    <Container>
      <MapContainer center={props.center} zoom={props.zoom}>
        <TileLayer attribution={osmAttribution} url="//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ScaleControl metric={true} imperial={false} maxWidth={150} />
        {geoJsonElement}
      </MapContainer>
    </Container>
  );
}

interface RegionCollection extends geojson.FeatureCollection<geojson.MultiPolygon> {
  features: Array<Region>;
}

function getFeatureCollection(regions: Region[]): RegionCollection {
  return { type: 'FeatureCollection', features: regions };
}
