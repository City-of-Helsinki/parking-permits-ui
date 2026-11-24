import { ApolloError } from '@apollo/client';
import {
  calcNetPrice,
  calcProductUnitPrice,
  calcProductUnitVatPrice,
  calcProductDates,
  calcProductDatesForRefund,
  calcVatPrice,
  canBeRefunded,
  combineDateAndTime,
  dateAsNumber,
  diffMonths,
  diffMonthsCeil,
  formatDate,
  formatDateTimeDisplay,
  formatErrors,
  formatMonthlyPrice,
  formatPermitEndDate,
  formatPermitStartDate,
  formatPrice,
  getEnvValue,
  getMonthCount,
  getPermitEndDate,
  getPermitStartDate,
  getRestrictions,
  getVehicleRestrictions,
  isOpenEndedPermitStarted,
  isPermitEditable,
  minDate,
  normalizeDateValue,
  upcomingProducts,
  validateTime,
} from './utils';
import englishTranslations from './i18n/en.json';
import { ParkingContractType, Permit, Product, Vehicle } from './types';

const PRODUCT_BASE_PRICE = 100;
const PRODUCT_DISCOUNT_PRICE = 80;
const PRODUCT_BASE_NET_PRICE = 80;
const VAT_RATE = 0.25;
const PRODUCT_BASE_VAT = 20;
const PRODUCT_DISCOUNT_VAT = 16;
const MONTHLY_PRICE = 30;
const PRICE_TO_ROUND = 90.955;
const ERROR_SEPARATOR = '\n';

const withSystemTime = (time: string, run: () => void) => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(time));
  try {
    run();
  } finally {
    vi.useRealTimers();
  }
};

const product: Product = {
  name: 'Zone A',
  vat: VAT_RATE,
  quantity: 1,
  startDate: '2026-01-01',
  endDate: '2026-02-01',
  unitPrice: PRODUCT_BASE_PRICE,
  totalPrice: PRODUCT_BASE_PRICE,
  basePrice: PRODUCT_BASE_PRICE,
  discountPrice: PRODUCT_DISCOUNT_PRICE,
  lowEmissionDiscount: 0,
};

const address: Permit['address'] = {
  id: 'address-1',
  streetName: 'Test Street',
  streetNameSv: 'Test Street',
  streetNumber: 1,
  city: 'Helsinki',
  citySv: 'Helsingfors',
  postalCode: '00100',
  primary: true,
};

const createProduct = (overrides: Partial<Product> = {}): Product => ({
  ...product,
  ...overrides,
});

const vehicle: Vehicle = {
  id: 'vehicle-1',
  isLowEmission: false,
  manufacturer: 'Toyota',
  model: 'Corolla',
  productionYear: 2020,
  registrationNumber: 'ABC-123',
  updatedFromTraficomOn: null,
  restrictions: [],
};

const createPermit = (overrides: Partial<Permit> = {}): Permit =>
  ({
    id: 'permit-1',
    contractType: ParkingContractType.FIXED_PERIOD,
    startTime: '2026-01-01T12:00:00',
    endTime: '2026-04-01T12:00:00',
    currentPeriodEndTime: '2026-02-01T12:00:00',
    monthCount: 3,
    monthsLeft: 2,
    products: [product],
    canBeRefunded: true,
    totalRefundAmount: 100,
    vehicle,
    address,
    ...overrides,
  } as unknown as Permit);

describe('formatErrors', () => {
  it('uses the supplied default for empty input', () => {
    expect(formatErrors('', 'request failed')).toBe('request failed');
  });

  it('returns a string error unchanged', () => {
    expect(formatErrors('request failed')).toBe('request failed');
  });

  it('joins GraphQL and parking permit error messages', () => {
    expect(
      formatErrors([{ message: 'first error' }, { message: 'second error' }])
    ).toBe(`first error${ERROR_SEPARATOR}second error`);
  });

  it('joins GraphQL errors from an ApolloError', () => {
    const error = new ApolloError({
      graphQLErrors: [{ message: 'first error' }, { message: 'second error' }],
    });

    expect(formatErrors(error)).toBe(
      `first error${ERROR_SEPARATOR}second error`
    );
  });

  it('uses server error messages from a network error', () => {
    const networkError = Object.assign(new Error('network failed'), {
      result: {
        errors: [{ message: 'server error' }, { message: 'another error' }],
      },
    });
    const error = new ApolloError({ networkError });

    expect(formatErrors(error)).toBe(
      `server error${ERROR_SEPARATOR}another error`
    );
  });

  it('falls back to the Apollo network error message or default', () => {
    const networkError = new ApolloError({
      networkError: new Error('network failed'),
    });

    expect(formatErrors(networkError)).toBe(networkError.message);
    expect(formatErrors(new ApolloError({}), 'request failed')).toBe(
      'request failed'
    );
  });
});

describe('product unit prices', () => {
  it('defaults to the base price without VAT or an emission discount', () => {
    expect(calcProductUnitPrice(product)).toBe(PRODUCT_BASE_PRICE);
    expect(calcProductUnitVatPrice(product)).toBeCloseTo(PRODUCT_BASE_VAT);
  });

  it('uses the discounted price when the vehicle is low emission', () => {
    expect(calcProductUnitPrice(product, true)).toBe(PRODUCT_DISCOUNT_PRICE);
    expect(calcProductUnitVatPrice(product, true)).toBeCloseTo(
      PRODUCT_DISCOUNT_VAT
    );
  });
});

describe('date helpers', () => {
  it('normalizes Date and string inputs', () => {
    const date = new Date('2026-03-04T12:30:00');

    expect(normalizeDateValue(date)).toBe(date);
    expect(normalizeDateValue('2026-03-04T12:30:00')).toEqual(date);
  });

  it('uses the current time for missing date values', () => {
    const now = new Date('2026-05-01T12:00:00');
    withSystemTime('2026-05-01T12:00:00', () => {
      expect(normalizeDateValue(undefined)).toEqual(now);
      expect(normalizeDateValue(null)).toEqual(now);
      expect(minDate(undefined, now)).toEqual(now);
    });
  });

  it.each(['9:05', '23:59', '18:21:05'])('accepts time %s', time => {
    expect(validateTime(time)).toBe(true);
  });

  it.each(['25:00', '12:60', '1:2', '12:00:60'])(
    'rejects invalid time %s',
    time => {
      expect(validateTime(time)).toBe(false);
    }
  );

  it('combines a date with a time', () => {
    const combined = combineDateAndTime(
      new Date('2026-03-04T00:00:00'),
      '14:30'
    );

    expect(combined).toEqual(new Date('2026-03-04T14:30:00'));
  });

  it('formats date and time values', () => {
    expect(formatDateTimeDisplay('2026-05-04T12:30:00')).toBe('4.5.2026 12:30');
    expect(formatDate('2026-05-04T12:30:00')).toBe('4.5.2026');
    expect(dateAsNumber('2026-05-04T12:30:00')).toBe(
      new Date('2026-05-04T12:30:00').valueOf()
    );
  });

  it('formats prices and monthly prices', () => {
    const translate = (key: string) => key;

    expect(formatPrice(PRICE_TO_ROUND)).toBe('90.96');
    expect(formatMonthlyPrice(MONTHLY_PRICE, translate)).toBe(
      '30.00 common.pricePerMonth'
    );
  });

  it('reads environment values from the process environment', () => {
    const key = 'PARKING_PERMITS_UTILS_TEST_VALUE';
    vi.stubEnv(key, 'test value');

    try {
      expect(getEnvValue(key)).toBe('test value');
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe('permit date and refund helpers', () => {
  it('selects the later start date and earlier end date', () => {
    const permit = createPermit({
      startTime: '2026-01-15T12:00:00',
      endTime: '2026-03-15T12:00:00',
    });
    const pricedProduct = createProduct({
      startDate: '2026-02-01T12:00:00',
      endDate: '2026-04-01T12:00:00',
    });

    expect(getPermitStartDate(pricedProduct, permit)).toBe(
      pricedProduct.startDate
    );
    expect(getPermitEndDate(pricedProduct, permit)).toBe(permit.endTime);
  });

  it('formats product dates within the permit date range', () => {
    const products = [
      createProduct({
        startDate: '2026-01-01T12:00:00',
        endDate: '2026-03-01T12:00:00',
      }),
      createProduct({
        startDate: '2026-02-01T12:00:00',
        endDate: '2026-04-01T12:00:00',
      }),
    ];
    const startPermit = createPermit({
      startTime: '2026-01-15T12:00:00',
      endTime: '2026-02-15T12:00:00',
    });
    const endPermit = createPermit({
      startTime: '2026-01-01T12:00:00',
      endTime: '2026-05-01T12:00:00',
    });

    expect(formatPermitStartDate(products, products[0], startPermit)).toBe(
      '15.1.2026'
    );
    expect(formatPermitStartDate(products, products[1], startPermit)).toBe(
      '1.2.2026'
    );
    expect(formatPermitEndDate(products, products[0], endPermit)).toBe(
      '1.3.2026'
    );
    expect(formatPermitEndDate(products, products[1], endPermit)).toBe(
      '1.4.2026'
    );
  });

  it('returns the earlier date or the current date when one is missing', () => {
    expect(minDate('2026-01-01T12:00:00', '2026-02-01T12:00:00')).toEqual(
      new Date('2026-01-01T12:00:00')
    );
  });

  it('finds an already-started open-ended permit', () => {
    withSystemTime('2026-01-10T12:00:00', () => {
      const started = createPermit({
        id: 'started',
        contractType: ParkingContractType.OPEN_ENDED,
        startTime: '2026-01-01T12:00:00',
      });
      const future = createPermit({
        id: 'future',
        contractType: ParkingContractType.OPEN_ENDED,
        startTime: '2026-01-20T12:00:00',
      });
      const fixed = createPermit({
        id: 'fixed',
        startTime: '2026-01-01T12:00:00',
      });

      expect(isOpenEndedPermitStarted([fixed, future, started])).toBe(started);
      expect(isOpenEndedPermitStarted([fixed, future])).toBeUndefined();
    });
  });

  it('calculates net and VAT prices', () => {
    expect(calcNetPrice(PRODUCT_BASE_PRICE, VAT_RATE)).toBeCloseTo(
      PRODUCT_BASE_NET_PRICE
    );
    expect(calcVatPrice(PRODUCT_BASE_PRICE, VAT_RATE)).toBeCloseTo(
      PRODUCT_BASE_VAT
    );
    expect(calcVatPrice(0, VAT_RATE)).toBe(0);
  });

  it('calculates month differences, rounding partial months up', () => {
    expect(diffMonths('2026-01-01T12:00:00', '2026-03-01T12:00:00')).toBe(2);
    expect(diffMonths('2026-01-01T12:00:00', '2026-01-15T12:00:00')).toBe(0);
    expect(diffMonths(undefined, '2026-03-01T12:00:00')).toBe(0);
    expect(diffMonthsCeil('2026-01-01T12:00:00', '2026-01-15T12:00:00')).toBe(
      1
    );
    expect(diffMonthsCeil('2026-01-01T12:00:00', '2026-03-01T12:00:00')).toBe(
      2
    );
  });

  it('calculates deprecated month counts for future and missing periods', () => {
    const permitEndStartDate = new Date('2026-02-01T12:00:00');
    const product = createProduct({ quantity: 3 });

    expect(
      getMonthCount(
        permitEndStartDate,
        '2026-03-01T12:00:00',
        product,
        '2026-04-01T12:00:00'
      )
    ).toBe(3);
    expect(
      getMonthCount(permitEndStartDate, '2026-01-01T12:00:00', product, '')
    ).toBe(0);

    withSystemTime('2026-01-01T12:00:00', () => {
      expect(
        getMonthCount(
          permitEndStartDate,
          '2026-01-01T12:00:00',
          product,
          '2026-04-01T12:00:00'
        )
      ).toBe(3);
    });
  });

  it('filters upcoming products and refund eligibility', () => {
    const expired = createProduct({ endDate: '2026-01-31T12:00:00' });
    const upcoming = createProduct({
      name: 'Upcoming product',
      endDate: '2026-03-01T12:00:00',
    });
    const permit = createPermit({
      currentPeriodEndTime: '2026-02-01T12:00:00',
      products: [expired, upcoming],
      canBeRefunded: true,
      totalRefundAmount: 10,
    });

    expect(upcomingProducts(permit)).toEqual([upcoming]);
    expect(canBeRefunded(permit)).toBe(true);
    expect(canBeRefunded(createPermit({ totalRefundAmount: 0 }))).toBe(false);
    expect(canBeRefunded(createPermit({ totalRefundAmount: null }))).toBe(
      false
    );
    expect(canBeRefunded(createPermit({ canBeRefunded: false }))).toBe(false);
  });

  it('checks permit editability against contract type and end date', () => {
    withSystemTime('2026-01-01T12:00:00', () => {
      expect(
        isPermitEditable(
          createPermit({ contractType: ParkingContractType.FIXED_PERIOD })
        )
      ).toBe(true);
      expect(
        isPermitEditable(
          createPermit({
            contractType: ParkingContractType.OPEN_ENDED,
            currentPeriodEndTime: '2026-01-06T12:00:00',
          })
        )
      ).toBe(true);
      expect(
        isPermitEditable(
          createPermit({
            contractType: ParkingContractType.OPEN_ENDED,
            currentPeriodEndTime: '2026-01-03T12:00:00',
          })
        )
      ).toBe(false);
    });
  });

  it('calculates product dates for permit and refund periods', () => {
    const product = createProduct({
      startDate: '2026-01-01T12:00:00',
      endDate: '2026-05-01T12:00:00',
    });
    const permit = createPermit({
      startTime: '2026-01-01T12:00:00',
      endTime: '2026-04-01T12:00:00',
      monthCount: 3,
      monthsLeft: 2,
    });

    expect(calcProductDates(product, permit)).toEqual({
      startDate: product.startDate,
      endDate: permit.endTime,
      monthCount: 3,
    });
    expect(calcProductDatesForRefund(product, permit)).toEqual({
      startDate: new Date('2026-02-01T12:00:00'),
      endDate: permit.endTime,
      monthCount: 2,
    });
  });

  it('maps known vehicle restrictions and omits unknown ones', () => {
    const translate = (key: string) =>
      englishTranslations[key as keyof typeof englishTranslations] ?? key;
    const restrictedVehicle = {
      ...vehicle,
      restrictions: ['03', 'unknown', '07'],
    };
    const unrestrictedVehicle = {
      ...vehicle,
      id: 'vehicle-2',
      restrictions: [],
    };

    expect(getRestrictions(restrictedVehicle, translate)).toEqual([
      'Driving ban',
      'Compulsory inspection neglected',
    ]);
    expect(
      getVehicleRestrictions(
        [restrictedVehicle, unrestrictedVehicle],
        translate
      )
    ).toEqual([
      {
        vehicle: restrictedVehicle,
        restrictions: ['Driving ban', 'Compulsory inspection neglected'],
      },
    ]);
  });
});
