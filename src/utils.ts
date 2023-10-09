import { GraphQLError } from 'graphql';
import { format, intervalToDuration } from 'date-fns';
import {
  ParkingContractType,
  ParkingPermitError,
  Permit,
  Product,
} from './types';

const PC_100 = 100;

type TranslateFunction = (name: string) => string;

export const formatErrors = (
  errors: ParkingPermitError[] | readonly GraphQLError[] | string[] | string,
  defaultError = 'common.genericError'
): string => {
  // normalizes errors into single string.
  if (!errors) {
    return defaultError;
  }
  if (typeof errors === 'string') {
    return errors;
  }
  if (typeof errors?.map === 'function') {
    return errors
      .map(e => (typeof e !== 'string' && e?.message) || e || defaultError)
      .join('\n');
  }
  return defaultError;
};

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
  // ensure accurate rounding e.g. 90.955 -> 90.96
  (Math.round(price * PC_100) / PC_100).toFixed(2);

export const formatMonthlyPrice = (
  price: number,
  t: TranslateFunction
): string => `${formatPrice(price)} ${t('common.pricePerMonth')}`;

export const formatPermitStartDate = (
  products: Product[],
  product: Product,
  permit: Permit
): string => {
  let date = product.startDate;
  if (product === products.at(0)) {
    date = permit.startTime as string;
  }
  return formatDate(date);
};

export const formatPermitEndDate = (
  products: Product[],
  product: Product,
  permit: Permit
): string => {
  let date = product.endDate;
  if (product === products.at(-1)) {
    date = permit.endTime as string;
  }
  return formatDate(date);
};

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
  product: Product,
  permitEndTime: string
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

  if (!permitStartTime || !permitEndTime) {
    return 0;
  }

  const intervalDuration = intervalToDuration({
    start: new Date(),
    end: new Date(permitEndTime),
  });

  // eslint-disable-next-line no-magic-numbers
  return (intervalDuration.years || 0) * 12 + (intervalDuration.months || 0);
};
