import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserAddress, Zone } from '../../../types';
import ParkingZonesMap from '../ParkingZonesMap';

const mocks = vi.hoisted(() => ({
  language: 'fi',
  mapContainer: vi.fn(),
  tileLayer: vi.fn(),
  marker: vi.fn(),
  geoJson: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: mocks.language },
  }),
}));

vi.mock('react-leaflet', () => ({
  MapContainer: (props: { children: React.ReactNode }) => {
    mocks.mapContainer(props);
    return <div data-testid="map">{props.children}</div>;
  },
  TileLayer: (props: unknown) => {
    mocks.tileLayer(props);
    return null;
  },
  Marker: (props: { children: React.ReactNode }) => {
    mocks.marker(props);
    return <div data-testid="marker">{props.children}</div>;
  },
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  GeoJSON: (props: unknown) => {
    mocks.geoJson(props);
    return null;
  },
}));

const zone = {
  name: 'Zone A',
  description: 'Description fi',
  descriptionSv: 'Description sv',
  location: [[[[1, 2]]]],
} as unknown as Zone;

// eslint-disable-next-line no-magic-numbers
const address = { location: [10, 20], zone } as unknown as UserAddress;

const renderMap = (
  props: Partial<React.ComponentProps<typeof ParkingZonesMap>> = {}
) => render(<ParkingZonesMap userAddress={address} zoom={5} {...props} />);

describe('ParkingZonesMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.language = 'fi';
  });

  it('configures map and marker with flipped coordinates and translated attribution', () => {
    renderMap();

    expect(mocks.mapContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        center: { lat: 20, lng: 10 },
        zoom: 5,
        attributionControl: true,
      })
    );
    expect(mocks.marker).toHaveBeenCalledWith(
      expect.objectContaining({ position: { lat: 20, lng: 10 } })
    );
    expect(mocks.tileLayer).toHaveBeenCalledWith(
      expect.objectContaining({ attribution: 'map.attribution.helsinki' })
    );
  });

  it.each([
    ['fi', 'fi'],
    ['sv', 'sv'],
    ['en', 'fi'],
  ])('uses %s language to build tile url', (language, urlLanguage) => {
    mocks.language = language;
    renderMap();
    expect(mocks.tileLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `https://maptiles.api.hel.fi/styles/hel-osm-bright-${urlLanguage}/{z}/{x}/{y}.png`,
      })
    );
  });

  it.each([
    ['fi', 'Zone A (Description fi)'],
    ['sv', 'Zone A (Description sv)'],
  ])('shows zone info in popup for %s', (language, text) => {
    mocks.language = language;
    renderMap();
    expect(screen.getByTestId('popup')).toHaveTextContent(text);
  });

  it('shows empty popup when address has no zone', () => {
    // eslint-disable-next-line no-magic-numbers
    renderMap({ userAddress: { location: [10, 20] } as UserAddress });
    expect(screen.getByTestId('popup')).toBeEmptyDOMElement();
  });

  it('renders zone polygon with styling only when zone is given', () => {
    renderMap({ zone });
    expect(mocks.geoJson).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { type: 'MultiPolygon', coordinates: zone.location },
        pathOptions: {
          color: '#0072c6',
          fillColor: '#b5daf7',
          fillOpacity: 0.5,
        },
      })
    );

    vi.clearAllMocks();
    renderMap();
    expect(mocks.geoJson).not.toHaveBeenCalled();
  });
});
