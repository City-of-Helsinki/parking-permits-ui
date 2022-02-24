import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from './common/mainLayout/MainLayout';
import AccountDetail from './pages/accountDetail/AccountDetail';
import AddressSelector from './pages/addressSelector/AddressSelector';
import ChangeAddress from './pages/changeAddress/ChangeAddress';
import DurationSelector from './pages/durationSelector/DurationSelector';
import LandingPage from './pages/landingPage/LandingPage';
import PermitPrices from './pages/permitPrices/PermitPrices';
import ProfilePage from './pages/profilePage/ProfilePage';
import PurchasedOverview from './pages/purchasedOverview/PurchasedOverview';
import Refund from './pages/refund/Refund';
import RegistrationNumbers from './pages/registrationNumbers/RegistrationNumbers';
import ValidPermits from './pages/validPermits/ValidPermits';
import VehicleSelector from './pages/vehicleSelector/VehicleSelector';
import { ROUTES } from './types';

const routes = [
  {
    path: ROUTES.BASE,
    element: <MainLayout />,
    children: [
      { path: ROUTES.CHANGE_ADDRESS, element: <ChangeAddress /> },
      { path: ROUTES.REFUND, element: <Refund /> },
      { path: ROUTES.ACCOUNT_DETAIL, element: <AccountDetail /> },
      { path: ROUTES.SUCCESS, element: <PurchasedOverview /> },
      { path: ROUTES.LANDING, element: <LandingPage /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
      {
        path: ROUTES.VEHICLE,
        element: <VehicleSelector />,
        children: [
          { path: ROUTES.CAR_REGISTRATIONS, element: <RegistrationNumbers /> },
          { path: ROUTES.PERMIT_PRICES, element: <PermitPrices /> },
        ],
      },
      { path: ROUTES.ADDRESS, element: <AddressSelector /> },
      { path: ROUTES.DURATION_SELECTOR, element: <DurationSelector /> },
      { path: ROUTES.VALID_PERMITS, element: <ValidPermits /> },
      { path: ROUTES.BASE, element: <Navigate to={ROUTES.LANDING} /> },
      { path: '*', element: <Navigate to={ROUTES.LANDING} /> },
    ],
  },
];

export default routes;
