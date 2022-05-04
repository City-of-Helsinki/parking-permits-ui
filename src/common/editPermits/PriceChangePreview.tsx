import { Button, IconArrowLeft, IconArrowRight } from 'hds-react';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PermitPriceChangeItem,
  PermitPriceChanges,
  Vehicle,
} from '../../types/permits';
import { formatDateDisplay, formatMonthlyPrice, formatVehicle } from '../utils';
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
  type: PriceChangeType;
  permitPriceChangeItem: PermitPriceChangeItem;
}

const PriceChangeItem: React.FC<PriceChangeItemProps> = ({
  className,
  type,
  permitPriceChangeItem,
}: PriceChangeItemProps) => {
  const { t } = useTranslation();
  const { product, newPrice, priceChange, startDate, endDate, monthCount } =
    permitPriceChangeItem;
  const monthlyPriceLabel =
    type === PriceChangeType.HIGHER_PRICE
      ? `${formatMonthlyPrice(priceChange)} (${formatMonthlyPrice(newPrice)})`
      : formatMonthlyPrice(newPrice);
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
          <b>{formatMonthlyPrice(newPrice * monthCount)}</b>
        </div>
      </div>
    </div>
  );
};

export interface PriceChangePreviewProps {
  className?: string;
  priceChangesList: PermitPriceChanges[];
  onConfirm: () => void;
  onCancel: () => void;
}

const PriceChangePreview: React.FC<PriceChangePreviewProps> = ({
  className,
  priceChangesList,
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
  let priceChangeType = PriceChangeType.NO_CHANGE;
  if (priceChangeTotal > 0) {
    priceChangeType = PriceChangeType.HIGHER_PRICE;
  } else if (priceChangeTotal < 0) {
    priceChangeType = PriceChangeType.LOWER_PRICE;
  } else {
    priceChangeType = PriceChangeType.NO_CHANGE;
  }
  return (
    <div className={className}>
      <div className="title">{t(`${T_PATH}.title`)}</div>
      <div className="price-change-detail">
        <div className="subtitle">{t(`${T_PATH}.subtitle`)}</div>
        {priceChangesList.map(({ permit, vehicle, priceChanges }) => (
          <div className="permit-price-changes" key={permit?.id || vehicle?.id}>
            <div className="vehicle">
              {formatVehicle((permit?.vehicle as Vehicle) || vehicle)}
            </div>
            {priceChanges.map((priceChangeItem, index) => (
              <Fragment
                key={`${priceChangeItem.product}-${priceChangeItem.startDate}`}>
                {index !== 0 && <div className="divider" />}
                <PriceChangeItem
                  className="price-change-item"
                  type={priceChangeType}
                  permitPriceChangeItem={priceChangeItem}
                />
              </Fragment>
            ))}
          </div>
        ))}
        <div className="total-info">
          <div className="row">
            <div>{t(`${T_PATH}.newOrderTotal`)}</div>
            <div>{newPriceTotal} €</div>
          </div>
          <div className="row">
            <div>{t(`${T_PATH}.previousOrderRemaining`)}</div>
            <div>{-previousPriceRemaining} €</div>
          </div>
          <div className="divider" />
          <div className="row">
            <div>{t(`${T_PATH}.priceDifference`)}</div>
            <div>{priceChangeTotal} €</div>
          </div>
          <div className="row">
            <div>{t(`${T_PATH}.priceCalcDescription`)}</div>
          </div>
        </div>
        {priceChangeType === PriceChangeType.LOWER_PRICE && (
          <div className="refund">
            <div className="row">
              <div>
                <b>{t(`${T_PATH}.refundTotal`)}</b>
              </div>
              <div>
                <b>{-priceChangeTotal} €</b>
              </div>
            </div>
            <div className="row">
              <div>{t(`${T_PATH}.refundTotalVat`)}</div>
              <div>{-priceChangeVatTotal} €</div>
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
