import { GraphQLFormattedError } from 'graphql';
import { format, intervalToDuration, addMonths } from 'date-fns';
import {
  ParkingContractType,
  ParkingPermitError,
  Permit,
  ProductDates,
  MaybeDate,
  Product,
  Vehicle,
} from './types';

const PC_100 = 100;

const dateFormat = 'd.M.yyyy HH:mm';

type TranslateFunction = (name: string) => string;

type Restrictions = {
  [key: string]: string;
};

const RESTRICTIONS: Restrictions = {
  '03': 'driving_ban',
  '07': 'compulsory_inspection_neglected',
  '10': 'periodic_inspection_rejected',
  '11': 'vehicle_stolen',
  '20': 'vehicle_deregistered',
  '22': 'vehicle_tax_due',
  '23': 'vehicle_prohibited_to_use_additional_tax',
  '24': 'old_vehicle_diesel_due',
  '25': 'registration_plates_confiscated',
  '34': 'driving_ban_registration_plates_confiscated',
};
export const formatErrors = (
  errors:
    | ParkingPermitError[]
    | readonly GraphQLFormattedError[]
    | string[]
    | string,
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

export const normalizeDateValue = (value: MaybeDate): Date => {
  if (!value) {
    return new Date();
  }
  if (typeof value === 'string') {
    return new Date(value);
  }
  return value;
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

export function formatDateTimeDisplay(datetime: MaybeDate): string {
  const dt = normalizeDateValue(datetime);
  return format(dt, dateFormat);
}

export const formatDate = (date: MaybeDate): string =>
  format(normalizeDateValue(date), 'd.M.yyyy');

export const formatPrice = (price: number): string =>
  // ensure accurate rounding e.g. 90.955 -> 90.96
  (Math.round(price * PC_100) / PC_100).toFixed(2);

export const formatMonthlyPrice = (
  price: number,
  t: TranslateFunction
): string => `${formatPrice(price)} ${t('common.pricePerMonth')}`;

export const dateAsNumber = (date: MaybeDate): number =>
  normalizeDateValue(date).valueOf();

export const formatPermitStartDate = (
  products: Product[],
  product: Product,
  permit: Permit
): string => {
  let date = product.startDate;
  if (product === products.at(0)) {
    date = permit.startTime as string;
  }
  if (
    permit.startTime &&
    permit.endTime &&
    permit.endTime < product.endDate &&
    products.length > 1
  ) {
    const startDate = Math.max(
      dateAsNumber(product.startDate),
      dateAsNumber(permit.startTime)
    );
    return formatDate(new Date(startDate));
  }
  return formatDate(date);
};

export const formatPermitEndDate = (
  products: Product[],
  product: Product,
  permit: Permit
): string => {
  if (
    permit.endTime &&
    permit.endTime > product.endDate &&
    products.length > 1
  ) {
    const endDate = Math.min(
      dateAsNumber(product.endDate),
      dateAsNumber(permit.endTime)
    );

    return formatDate(new Date(endDate));
  }
  return formatDate(permit.endTime);
};

export const isOpenEndedPermitStarted = (
  permits: Permit[]
): Permit | undefined =>
  permits.find(
    p =>
      p.contractType === ParkingContractType.OPEN_ENDED &&
      new Date(p.startTime as string).valueOf() < new Date().valueOf()
  );

export const calcNetPrice = (grossPrice: number, vatRate: number): number =>
  grossPrice ? grossPrice / (1 + (vatRate || 0)) : 0;

export const calcVatPrice = (grossPrice: number, vatRate: number): number =>
  grossPrice ? grossPrice - calcNetPrice(grossPrice, vatRate) : 0;

export const calcProductUnitPrice = (
  product: Product,
  isLowEmission?: boolean,
  isVat?: boolean
): number => {
  // returns modified unit price if low-emission vehicle, otherwise returns full price
  const { basePrice, discountPrice, vat } = product;

  const price = isLowEmission ? discountPrice : basePrice;

  return isVat ? calcVatPrice(price, vat) : price;
};

export const calcProductUnitVatPrice = (
  product: Product,
  isLowEmission?: boolean
): number => calcProductUnitPrice(product, isLowEmission, true);

export const getPermitStartDate = (
  product: Product,
  permit: Permit
): MaybeDate => {
  const { startDate: productStartTime } = product;
  const { startTime: permitStartTime } = permit;

  return dateAsNumber(productStartTime) > dateAsNumber(permitStartTime)
    ? productStartTime
    : permitStartTime;
};

export const getPermitEndDate = (
  product: Product,
  permit: Permit
): MaybeDate => {
  const { endDate: productEndTime } = product;
  const { endTime: permitEndTime } = permit;

  return dateAsNumber(productEndTime) < dateAsNumber(permitEndTime)
    ? productEndTime
    : permitEndTime;
};

export const diffMonths = (
  startTime: MaybeDate,
  endTime: MaybeDate
): number => {
  if (!startTime || !endTime) {
    return 0;
  }

  const intervalDuration = intervalToDuration({
    start: normalizeDateValue(startTime),
    end: normalizeDateValue(endTime),
  });

  // eslint-disable-next-line no-magic-numbers
  return (intervalDuration.years || 0) * 12 + (intervalDuration.months || 0);
};

export const diffMonthsCeil = (
  startTime: MaybeDate,
  endTime: MaybeDate
): number => {
  if (!startTime || !endTime) {
    return 0;
  }

  const intervalDuration = intervalToDuration({
    start: normalizeDateValue(startTime),
    end: normalizeDateValue(endTime),
  });

  // eslint-disable-next-line no-magic-numbers
  const months =
    // eslint-disable-next-line no-magic-numbers
    (intervalDuration.years ?? 0) * 12 + (intervalDuration.months ?? 0);

  return (intervalDuration.days ?? 0) > 0 ? months + 1 : months;
};

export const getMonthCount = (
  permitEndStartDate: Date,
  permitStartTime: string,
  product: Product,
  permitEndTime: string
): number => {
  // DEPRECATED: use diffMonths instead.
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

// return permit products which end later than the permit end time
export const upcomingProducts = (permit: Permit): Array<Product> =>
  permit.products.filter(
    product =>
      dateAsNumber(product.endDate) > dateAsNumber(permit.currentPeriodEndTime)
  );

// checks that permit vehicle or address can be changed
export const isPermitEditable = (permit: Permit): boolean => {
  if (permit.contractType === ParkingContractType.FIXED_PERIOD) {
    return true;
  }
  const interval = intervalToDuration({
    start: new Date(),
    end: normalizeDateValue(permit.currentPeriodEndTime),
  });

  return (interval.days ?? 0) > 3;
};

export const calcProductDates = (
  product: Product,
  permit: Permit
): ProductDates => {
  const startDate = getPermitStartDate(product, permit);
  const endDate = getPermitEndDate(product, permit);
  return {
    startDate,
    endDate,
    monthCount: diffMonths(startDate, endDate) || 1,
  };
};

export const calcProductDatesForRefund = (
  product: Product,
  permit: Permit
): ProductDates => {
  const monthsUsed = permit.monthCount - permit.monthsLeft;
  const productStartDate = getPermitStartDate(product, permit);

  const minStartTime =
    monthsUsed > 0
      ? addMonths(normalizeDateValue(permit.startTime), monthsUsed)
      : productStartDate;

  const startDate =
    dateAsNumber(productStartDate) > dateAsNumber(minStartTime)
      ? productStartDate
      : minStartTime;

  const endDate = getPermitEndDate(product, permit);

  const monthCount = diffMonthsCeil(startDate, endDate);

  return {
    startDate,
    endDate,
    monthCount,
  };
};

export const getRestrictions = (
  vehicle: Vehicle,
  t: TranslateFunction
): Array<string> =>
  (vehicle.restrictions ?? [])
    .map((code: string): string => {
      const translation = RESTRICTIONS[code] ?? null;
      return translation ? t(`common.restrictions.${translation}`) : '';
    })
    .filter(Boolean);

export const canBeRefunded = (permit: Permit): boolean =>
  permit.canBeRefunded && permit.totalRefundAmount > 0;
