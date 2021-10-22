import { Checkbox, Link } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { Permit } from '../../types';
import './lowEmissionConsent.scss';

const T_PATH = 'pages.permitPrices.PermitPrices';

const DiscountCheckboxLabel = (): React.ReactElement => {
  const { t } = useTranslation();
  const discountInfoUrl =
    'https://www.hel.fi/helsinki/fi/kartat-ja-liikenne/pysakointi/vahapaastoisten_alennus';
  return (
    <>
      <span>{t(`${T_PATH}.discount`)}</span>{' '}
      <Link openInNewTab href={discountInfoUrl}>
        {t(`${T_PATH}.readMore`)}
      </Link>
    </>
  );
};

export interface Props {
  permits: Permit[];
  updatePermitData: (
    permitsToUpdate: Permit[],
    payload: Partial<Permit>
  ) => void;
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
                <DiscountCheckboxLabel />
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
                    updatePermitData([permit], {
                      consentLowEmissionAccepted: evt.target.checked,
                    })
                  }
                  label={
                    permits?.length > 1 ? (
                      permit.vehicle.registrationNumber
                    ) : (
                      <DiscountCheckboxLabel />
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
