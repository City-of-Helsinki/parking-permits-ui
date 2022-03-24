import { PermitPriceChangeItem } from '../../types';

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
