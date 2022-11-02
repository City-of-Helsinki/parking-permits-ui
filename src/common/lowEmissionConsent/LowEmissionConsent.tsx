import { Checkbox } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { Permit } from '../../types';
import './lowEmissionConsent.scss';
import DiscountLabel from '../discountLabel/DiscountLabel';

const T_PATH = 'pages.permitPrices.PermitPrices';

export interface Props {
  permits: Permit[];
  updatePermitData: (payload: Partial<Permit>, permitId?: string) => void;
}
const LowEmissionConsent = ({
  permits,
  updatePermitData,
}: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="low-emission-consent-component">
      {permits?.some(permit => permit.vehicle.isLowEmission) && (
        <>
          <div className="section-label">{t(`${T_PATH}.lowEmissionLabel`)}</div>
          <div className="discount">
            {permits?.length > 1 && (
              <div className="discount-label">
                <DiscountLabel />
              </div>
            )}

            {permits
              ?.filter(permit => permit?.vehicle?.isLowEmission)
              .map(permit => (
                <Checkbox
                  key={uuidv4()}
                  className="discount-checkbox"
                  id={uuidv4()}
                  checked={permit?.consentLowEmissionAccepted}
                  onChange={evt =>
                    updatePermitData(
                      {
                        consentLowEmissionAccepted: evt.target.checked,
                      },
                      permit.id
                    )
                  }
                  label={
                    permits?.length > 1 ? (
                      permit.vehicle.registrationNumber
                    ) : (
                      <DiscountLabel />
                    )
                  }
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LowEmissionConsent;
