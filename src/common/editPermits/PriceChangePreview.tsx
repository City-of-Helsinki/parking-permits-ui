import { Button, IconArrowLeft, IconArrowRight } from 'hds-react';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { uniqueId } from 'lodash';
import {
  PermitPriceChangeItem,
  PermitPriceChanges,
  Vehicle,
} from '../../types/permits';
import { formatDateDisplay, formatVehicle } from '../utils';
import { formatMonthlyPrice, formatPrice } from '../../utils';
import './PriceChangePreview.scss';
import { getPermitPriceTotal } from './utils';

const T_PATH = 'common.editPermits.PriceChangePreview';

enum PriceChangeType {
  HIGHER_PRICE,
  LOWER_PRICE,
  NO_CHANGE,
}

interface PriceChangeItemProps {
  className?: string;
  permitPriceChangeItem: PermitPriceChangeItem;
}

const PriceChangeItem: React.FC<PriceChangeItemProps> = ({
  className,
  permitPriceChangeItem,
}: PriceChangeItemProps) => {
  const { t } = useTranslation();
  const { product, newPrice, startDate, endDate, monthCount } =
    permitPriceChangeItem;

  const monthlyPriceLabel = formatMonthlyPrice(newPrice, t);
  return (
    <div className={className}>
      <div className="row">
        <div>
          <b>{product}</b>
        </div>
        <div>
          <span>{monthlyPriceLabel}</span>
        </div>
      </div>
      <div className="row">
        <div>
          {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
        </div>
      </div>
      <div className="row">
        <div>
          {t(`${T_PATH}.priceChangeItemTotalLabel`, { count: monthCount })}
        </div>
        <div>
          <b>{formatPrice(newPrice * monthCount)} &euro;</b>
        </div>
      </div>
    </div>
  );
};

export interface PriceChangePreviewProps {
  className?: string;
  priceChangesList: PermitPriceChanges[];
  isRefund?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const getPriceChangeType = (priceChangeTotal: number): PriceChangeType => {
  if (priceChangeTotal > 0) {
    return PriceChangeType.HIGHER_PRICE;
  }
  if (priceChangeTotal < 0) {
    return PriceChangeType.LOWER_PRICE;
  }
  return PriceChangeType.NO_CHANGE;
};

const PriceChangePreview: React.FC<PriceChangePreviewProps> = ({
  className,
  priceChangesList,
  isRefund,
  onConfirm,
  onCancel,
}: PriceChangePreviewProps) => {
  const { t } = useTranslation();
  const newPriceTotal = priceChangesList.reduce(
    (total, item) => total + getPermitPriceTotal(item.priceChanges, 'newPrice'),
    0
  );
  const previousPriceRemaining = priceChangesList.reduce(
    (total, item) =>
      total + getPermitPriceTotal(item.priceChanges, 'previousPrice'),
    0
  );
  const priceChangeTotal = priceChangesList.reduce(
    (total, item) =>
      total + getPermitPriceTotal(item.priceChanges, 'priceChange'),
    0
  );
  const priceChangeVatTotal = priceChangesList.reduce(
    (total, item) =>
      total + getPermitPriceTotal(item.priceChanges, 'priceChangeVat'),
    0
  );
  const priceChangeType = getPriceChangeType(priceChangeTotal);
  const isLowerPriceChange = priceChangeType === PriceChangeType.LOWER_PRICE;
  const refundable = isRefund || isLowerPriceChange;

  return (
    <div className={className}>
      <div className="title">{t(`${T_PATH}.title`)}</div>
      <div className="price-change-detail">
        {priceChangesList.map(({ permit, vehicle, priceChanges }) => (
          <div className="permit-price-changes" key={uniqueId()}>
            <div className="vehicle">
              {formatVehicle((permit?.vehicle as Vehicle) || vehicle)}
            </div>
            <div className="vehicle-copyright">
              © {t(`${T_PATH}.vehicleCopyright`)}
            </div>
            {priceChanges.map((priceChangeItem, index) => (
              <Fragment key={uniqueId()}>
                {index !== 0 && <div className="divider" />}
                <PriceChangeItem
                  className="price-change-item"
                  permitPriceChangeItem={priceChangeItem}
                />
              </Fragment>
            ))}
          </div>
        ))}
        {!isRefund && (
          <div className="total-info">
            <div className="row">
              <div>{t(`${T_PATH}.newOrderTotal`)}</div>
              <div>{formatPrice(newPriceTotal)} &euro;</div>
            </div>
            <div className="row">
              <div>{t(`${T_PATH}.previousOrderRemaining`)}</div>
              <div>{formatPrice(-previousPriceRemaining)} &euro;</div>
            </div>
            <div className="divider" />
            <div className="row">
              <div>{t(`${T_PATH}.priceDifference`)}</div>
              <div>{formatPrice(priceChangeTotal)} &euro;</div>
            </div>
            <div className="row">
              <div>{t(`${T_PATH}.priceCalcDescription`)}</div>
            </div>
          </div>
        )}
        {refundable && (
          <div className="refund">
            <div className="row">
              <div>
                <b>{t(`${T_PATH}.refundTotal`)}</b>
              </div>
              <div>
                <b>
                  {formatPrice(
                    isRefund ? Math.abs(priceChangeTotal) : priceChangeTotal
                  )}{' '}
                  &euro;
                </b>
              </div>
            </div>
            <div className="row">
              <div>{t(`${T_PATH}.refundTotalVat`)}</div>
              <div>
                {formatPrice(
                  isRefund ? Math.abs(priceChangeVatTotal) : priceChangeVatTotal
                )}{' '}
                &euro;
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="action-buttons">
        <Button
          type="submit"
          className="action-btn"
          iconRight={<IconArrowRight />}
          onClick={() => onConfirm()}
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
        </Button>
        <Button
          className="action-btn"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => onCancel()}
          theme="black">
          <span>{t(`${T_PATH}.actionBtn.cancel`)}</span>
        </Button>
      </div>
    </div>
  );
};
export default PriceChangePreview;
