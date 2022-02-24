export enum ROUTES {
  BASE = '/',
  LANDING = '/landing-page',
  CHANGE_ADDRESS = '/change-address/',
  REFUND = '/refund',
  ACCOUNT_DETAIL = '/account-detail',
  SUCCESS = '/success',
  PROFILE = '/profile',
  VEHICLE = '/vehicle',
  ADDRESS = '/address',
  AUTH_ERROR = '/auth-error',
  VALID_PERMITS = '/valid-permits',
  END_PERMITS = '/end-permits',
  DURATION_SELECTOR = '/duration-selector',
  CAR_REGISTRATIONS = '/vehicle/registrations',
  PERMIT_PRICES = '/vehicle/permit-prices',
}

export enum STEPPER {
  HIDE_STEPPER = 0,
  ADDRESS_SELECTOR = 1,
  VEHICLE_SELECTOR = 2,
  // eslint-disable-next-line no-magic-numbers
  PERMIT_PRICES = 2.2,
  DURATION_SELECTOR = 3,
  PURCHASED_VIEW = 4,
}

export enum ParkingContractType {
  FIXED_PERIOD = 'FIXED_PERIOD',
  OPEN_ENDED = 'OPEN_ENDED',
}

export enum ParkingStartType {
  IMMEDIATELY = 'IMMEDIATELY',
  FROM = 'FROM',
}

export enum PermitStatus {
  DRAFT = 'DRAFT',
  PAYMENT_IN_PROGRESS = 'PAYMENT_IN_PROGRESS',
  VALID = 'VALID',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}
export enum PermitEndType {
  IMMEDIATELY = 'IMMEDIATELY',
  AFTER_CURRENT_PERIOD = 'AFTER_CURRENT_PERIOD',
}

export enum EndPermitStep {
  REFUND = 'REFUND',
  ACCOUNT = 'ACCOUNT',
  RESULT = 'RESULT',
}
