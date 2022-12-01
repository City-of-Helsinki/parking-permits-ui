import { format, intervalToDuration } from 'date-fns';
import { ParkingContractType, Permit, Product } from './types';

export const validateTime = (time: string): boolean =>
  /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(time);

export const combineDateAndTime = (date: Date, time: string): Date => {
  const dateString = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;
  return new Date(`${dateString} ${time}`);
};

export function getEnv(key: string): string {
  const variable = process.env[key];
  if (variable === undefined) {
    throw new Error(`No ${key} specified.`);
  }
  return variable;
}

export function getBooleanEnv(key: string): boolean {
  const val = getEnv(key);
  return ['true', '1'].includes(val);
}

export function formatDateTimeDisplay(datetime: string | Date): string {
  const dt = typeof datetime === 'string' ? new Date(datetime) : datetime;
  const dateStr = dt.toLocaleDateString('fi');
  const timeStr = dt.toLocaleTimeString('fi');
  return `${dateStr}, ${timeStr}`;
}

export const formatDate = (date: string | Date): string =>
  format(typeof date === 'string' ? new Date(date) : date, 'd.M.yyyy');

export const formatPrice = (price: number): string =>
  parseFloat(price.toString()).toFixed(2);

export const formatMonthlyPrice = (price: number): string =>
  `${formatPrice(price)} €/kk`;

export const isOpenEndedPermitStarted = (
  permits: Permit[]
): Permit | undefined =>
  permits.find(
    p =>
      p.contractType === ParkingContractType.OPEN_ENDED &&
      new Date(p.startTime as string).valueOf() < new Date().valueOf()
  );

export const dateAsNumber = (date: Date | string): number =>
  new Date(date).valueOf();

export const getMonthCount = (
  permitEndStartDate: Date,
  permitStartTime: string,
  product: Product
): number => {
  // It should consider the start time of the permit.
  // Eg: If permit was bought and started just before the permitEndStartDate
  // then it should be counted as a full month used and if the start date is in
  // the future. It should refund the whole month.
  if (
    dateAsNumber(permitStartTime) > permitEndStartDate.valueOf() ||
    dateAsNumber(product.startDate) > permitEndStartDate.valueOf()
  ) {
    return product.quantity;
  }

  const intervalDuration = intervalToDuration({
    start: new Date(),
    end: new Date(product.endDate),
  });
  return intervalDuration.months || 0;
};
