export enum ROUTES {
  BASE = '/',
  CALLBACK = '/callback',
  LANDING = '/landing-page',
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
  CHANGE_ADDRESS = '/change-address',
  CHANGE_VEHICLE = '/change-vehicle/:permitId',
  TEMPORARY_VEHICLE = '/temporary-vehicle/:permitId',
  EXTEND_PERMIT = '/extend-permit/:permitId',
}

export enum STEPPER {
  VALID_PERMITS = 0,
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
  PRELIMINARY = 'PRELIMINARY',
  PAYMENT_IN_PROGRESS = 'PAYMENT_IN_PROGRESS',
  VALID = 'VALID',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}
export enum PermitEndType {
  IMMEDIATELY = 'IMMEDIATELY',
  AFTER_CURRENT_PERIOD = 'AFTER_CURRENT_PERIOD',
}

export enum PermitEditType {
  TEMPORARY = 'TEMPORARY',
  NEW = 'NEW',
}

export enum EndPermitStep {
  REFUND = 'REFUND',
  RESULT = 'RESULT',
  PRICE_PREVIEW = 'PRICE_PREVIEW',
}
