import { PermitPriceChangeItem, PermitPriceChanges } from '../../types';

// eslint-disable-next-line import/prefer-default-export
export function getPermitPriceTotal(
  priceChanges: PermitPriceChangeItem[],
  priceType: 'newPrice' | 'previousPrice' | 'priceChange' | 'priceChangeVat'
): number {
  return priceChanges.reduce(
    (total, item) => total + item[priceType] * item.monthCount,
    0
  );
}

export const getChangeTotal = (
  priceChangesList: PermitPriceChanges[],
  priceType: 'newPrice' | 'previousPrice' | 'priceChange' | 'priceChangeVat'
): number =>
  priceChangesList.reduce(
    (total, item) => total + getPermitPriceTotal(item.priceChanges, priceType),
    0
  );
