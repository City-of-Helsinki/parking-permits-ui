import React, { useLayoutEffect } from 'react';

import { Point } from '../../common/types';
import Hero from '../../common/hero/Hero';
import ParkingRegionsMap from '../../common/parking-region-map/ParkingRegionsMap';

// eslint-disable-next-line no-magic-numbers
const HELSINKI_CORDS: Point = [60.17, 24.94];

const FrontPage = (): React.ReactElement => {
  useLayoutEffect(() => window.scrollTo(0, 0), []);

  return (
    <>
      <Hero title="page.front.title" />
      <ParkingRegionsMap center={HELSINKI_CORDS} zoom={12} />
    </>
  );
};

export default FrontPage;
