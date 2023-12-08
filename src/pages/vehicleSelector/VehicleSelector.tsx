import { Notification } from 'hds-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router-dom';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES } from '../../types';
import './vehicleSelector.scss';

const T_PATH = 'pages.vehicleSelector.VehicleSelector';

const VehicleSelector = (): React.ReactElement => {
  const { t } = useTranslation();
  const permitCtx = useContext(PermitStateContext);
  const selectedAddress = permitCtx?.getSelectedAddress();

  if (!selectedAddress) {
    return <Navigate to={ROUTES.ADDRESS} />;
  }

  return (
    <div className="vehicle-selector-component">
      <div className="zone__type">
        <div className="zone__type__symbol">{selectedAddress?.zone?.name}</div>
        <div className="zone__type__label">{t(`${T_PATH}.label`)}</div>
      </div>
      <div className="section-label">{t(`${T_PATH}.sectionLabel`)}</div>
      <div className="purchase-amount-info">
        {t(`${T_PATH}.noOfVehicleInformation`)}
      </div>
      {permitCtx?.getStatus() === 'error' && (
        <Notification type="error" className="error-notification">
          {t(permitCtx?.getErrorMessage() || '')}
          <div>© {t(`${T_PATH}.vehicleCopyright`)}</div>
        </Notification>
      )}
      <Outlet />
    </div>
  );
};

export default VehicleSelector;
