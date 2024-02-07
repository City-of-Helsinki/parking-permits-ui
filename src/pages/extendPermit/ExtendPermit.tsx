import React, { useContext } from 'react';

import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';

import {
  Button,
  Card,
  IconArrowLeft,
  IconArrowRight,
  LoadingSpinner,
  NumberInput,
} from 'hds-react';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES } from '../../types';
import { formatPrice, formatDate } from '../../utils';
// import { extendPermit } from '../../graphql/permitGqlClient';

const MAX_MONTHS = 12;

// TBD use own Path
const T_PATH = 'pages.durationSelector.DurationSelector';

const ExtendPermit = (): React.ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: T_PATH });
  const navigate = useNavigate();
  const params = useParams();
  const permitCtx = useContext(PermitStateContext);

  const permit = permitCtx?.getPermits().find(p => p.id === params.permitId);

  if (!permit) {
    return <Navigate to={ROUTES.VALID_PERMITS} />;
  }

  const updateMonthCount = (monthCount: number) => {};
  const orderRequest = null;

  const getPrices = items => (
    <div className="prices">
      {items.map(item => (
        <div key={uuidv4()} className="price">
          <div>{`(${formatDate(item.startDate)} - ${formatDate(
            item.endDate
          )})`}</div>
          <div style={{ marginRight: '4px' }}>{t('total')}</div>
          <div className="offer">{`${formatPrice(item.price)} €`}</div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="duration-selector-component">
      <Card className="card">
        <div className="header" style={{ fontWeight: 'bolder' }}>
          Pidennä pysäköinnin voimassoloaika
        </div>
      </Card>
      <div>
        <NumberInput
          style={{ maxWidth: '250px' }}
          className="month-selection"
          id={uuidv4()}
          helperText={t('monthSelectionHelpText', {
            max: MAX_MONTHS,
          })}
          label=""
          min={1}
          step={1}
          max={MAX_MONTHS}
          defaultValue={permit?.monthCount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            updateMonthCount(parseInt(e.target.value || '0', 10));
          }}
        />
      </div>
      <div className="price-info hide-in-desktop">
        <div>{t('permitPrice')}</div>
        {getPrices(permit)}
      </div>
      <div className="action-buttons">
        <Button theme="black" className="action-btn">
          {orderRequest && <LoadingSpinner small />}
          {!orderRequest && (
            <>
              <span>{t('actionBtn.continue')}</span>
              <IconArrowRight />
            </>
          )}
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          <span>{t('actionBtn.back')}</span>
        </Button>
      </div>
    </div>
  );
};

export default ExtendPermit;
