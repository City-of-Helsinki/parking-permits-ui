import { Container } from 'hds-react';
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../types';
import Footer from '../footer/Footer';
import Navbar from '../navbar/Navbar';
import Stepper from '../stepper/Stepper';
import './mainLayout.scss';

const SHOW_STEPPER_ROUTES = [
  ROUTES.PERMIT_PRICES,
  ROUTES.DURATION_SELECTOR,
  ROUTES.SUCCESS,
];

const MainLayout = (): React.ReactElement => {
  const location = useLocation();
  const canShowStepper = () =>
    SHOW_STEPPER_ROUTES.includes(location.pathname as ROUTES);

  return (
    <div className="main-page">
      <div style={{ width: '100%' }}>
        <Navbar showNavItems={!canShowStepper()} />
        {canShowStepper() && (
          <Stepper style={{ background: 'var(--color-white)' }} />
        )}
      </div>
      <Container className="main-page__container">
        <Outlet />
      </Container>
      <Footer />
    </div>
  );
};

export default MainLayout;
