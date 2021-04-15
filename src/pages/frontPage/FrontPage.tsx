import React, { useLayoutEffect } from 'react';

import Hero from '../../components/hero/Hero';
import Layout from '../../components/layout/Layout';
import ParkingRegionsMap from '../../components/parking-region-map/ParkingRegionsMap';

const FrontPage = () => {
  useLayoutEffect(() => window.scrollTo(0, 0), []);

  return (
    <Layout>
      <Hero title="page.front.title" />
      <ParkingRegionsMap center={[60.17, 24.94]} zoom={12} />
    </Layout>
  );
};

export default FrontPage;
