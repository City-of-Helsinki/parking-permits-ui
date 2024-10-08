import React, { useContext, useCallback, useState } from 'react';

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
  Notification,
  NumberInput,
} from 'hds-react';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES, ExtendedPriceListItem } from '../../types';
import { formatPrice, formatDate, formatErrors } from '../../utils';
import {
  getExtendedPriceList,
  extendPermit,
} from '../../graphql/permitGqlClient';
import './extendPermit.scss';

// TBD use own Path
const T_PATH = 'pages.extendPermit.ExtendPermit';

const ExtendPermit = (): React.ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: T_PATH });
  const navigate = useNavigate();
  const params = useParams();
  const permitCtx = useContext(PermitStateContext);
  const [monthCount, setMonthCount] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState<Array<ExtendedPriceListItem>>([]);

  const permit = permitCtx?.getPermits().find(p => p.id === params.permitId);

  const updateMonthCount = useCallback(
    async (updatedMonthCount: number) => {
      if (permit) {
        setMonthCount(updatedMonthCount);
        setError('');
        if (updatedMonthCount === 0) {
          setPrices([]);
          return;
        }
        // fetch prices...
        setLoading(true);
        await getExtendedPriceList(permit.id, updatedMonthCount)
          .then(setPrices)
          .catch(errors => setError(formatErrors(errors)));
        setLoading(false);
      }
    },
    [permit]
  );

  const createExtendPermit = useCallback(async () => {
    if (monthCount > 0 && !!permit) {
      setError('');
      setLoading(true);
      const { checkoutUrl } = await extendPermit(permit.id, monthCount);
      if (checkoutUrl) {
        window.open(`${checkoutUrl}`, '_self');
      } else {
        setLoading(false);
        setError(t('error'));
      }
    }
  }, [permit, monthCount, t]);

  if (!permit) {
    return <Navigate to={ROUTES.VALID_PERMITS} />;
  }

  const getTotalPrice = (priceList: Array<ExtendedPriceListItem>): number =>
    priceList.reduce((acc, item) => acc + item.price, 0);

  const getPrices = (priceList: Array<ExtendedPriceListItem>) => (
    <div className="prices">
      {priceList.map((item: ExtendedPriceListItem) => (
        <div key={uuidv4()} className="price">
          <div>{`(${formatDate(item.startDate)} - ${formatDate(
            item.endDate
          )})`}</div>
          <div className="offer">{`${formatPrice(item.price)} €`}</div>
        </div>
      ))}

      <div className="price">
        <div style={{ marginRight: '4px' }}>{t('total')}</div>
        <div className="offer">{`${formatPrice(
          getTotalPrice(priceList)
        )} €`}</div>
      </div>
    </div>
  );

  return (
    <div className="extend-permit-component">
      <Card className="card">
        <div className="header" style={{ fontWeight: 'bolder' }}>
          {t('header')}
        </div>

        {error && (
          <Notification type="error" className="error-notification">
            {t(error || '')}
          </Notification>
        )}
        <div>
          <NumberInput
            style={{ maxWidth: '250px' }}
            className="month-selection"
            id={uuidv4()}
            helperText={t('monthSelectionHelpText', {
              max: permit.maxExtensionMonthCount,
            })}
            label=""
            min={1}
            step={1}
            max={permit.maxExtensionMonthCount}
            defaultValue={monthCount}
            disabled={isLoading}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              updateMonthCount(parseInt(e.target.value || '0', 10));
            }}
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />
        </div>
      </Card>
      {prices.length > 0 && (
        <div className="price-info">{getPrices(prices)}</div>
      )}
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          onClick={createExtendPermit}
          disabled={isLoading}>
          {isLoading && <LoadingSpinner small />}
          {!isLoading && (
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
