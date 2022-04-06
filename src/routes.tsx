import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from './common/mainLayout/MainLayout';
import AddressSelector from './pages/addressSelector/AddressSelector';
import ChangeAddress from './pages/changeAddress/ChangeAddress';
import DurationSelector from './pages/durationSelector/DurationSelector';
import EndPermit from './pages/endPermit/EndPermit';
import LandingPage from './pages/landingPage/LandingPage';
import PermitPrices from './pages/permitPrices/PermitPrices';
import ProfilePage from './pages/profilePage/ProfilePage';
import PurchasedOverview from './pages/purchasedOverview/PurchasedOverview';
import ValidPermits from './pages/validPermits/ValidPermits';
import VehicleSelector from './pages/vehicleSelector/VehicleSelector';
import { ROUTES } from './types';

const routes = [
  {
    path: ROUTES.BASE,
    element: <MainLayout />,
    children: [
      { path: ROUTES.SUCCESS, element: <PurchasedOverview /> },
      { path: ROUTES.LANDING, element: <LandingPage /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
      {
        path: ROUTES.VEHICLE,
        element: <VehicleSelector />,
        children: [{ path: ROUTES.PERMIT_PRICES, element: <PermitPrices /> }],
      },
      { path: ROUTES.ADDRESS, element: <AddressSelector /> },
      { path: ROUTES.DURATION_SELECTOR, element: <DurationSelector /> },
      { path: ROUTES.VALID_PERMITS, element: <ValidPermits /> },
      { path: ROUTES.END_PERMITS, element: <EndPermit /> },
      { path: ROUTES.CHANGE_ADDRESS, element: <ChangeAddress /> },
      { path: ROUTES.BASE, element: <Navigate to={ROUTES.LANDING} /> },
      { path: '*', element: <Navigate to={ROUTES.LANDING} /> },
    ],
  },
];

export default routes;
