import { ParkingContractType, ParkingStartType, PermitStatus } from './enums';
import { UserAddress, Zone } from './user';

export type MaybeDate = Date | string | undefined | null;
export interface Product {
  name: string;
  vat: number;
  quantity: number;
  endDate: string;
  startDate: string;
  unitPrice: number;
  totalPrice: number;
  basePrice: number;
  discountPrice: number;
  lowEmissionDiscount: number;
}

export type TemporaryVehicle = {
  id: string;
  vehicle: Vehicle;
  startTime: MaybeDate;
  endTime: MaybeDate;
  isActive: boolean;
};

export type ProductDates = {
  startDate: MaybeDate;
  endDate: MaybeDate;
  monthCount: number;
};

export type Permit = {
  id: string;
  talpaOrderId: string;
  receiptUrl: string;
  checkoutUrl: string;
  updateCardUrl: string;
  startType?: ParkingStartType;
  startTime?: MaybeDate;
  endTime?: MaybeDate;
  status: PermitStatus;
  primaryVehicle: boolean;
  consentLowEmissionAccepted: boolean;
  vehicle: Vehicle;
  activeTemporaryVehicle: TemporaryVehicle;
  temporaryVehicles: TemporaryVehicle[];
  products: Product[];
  contractType: ParkingContractType;
  monthCount: number;
  parkingZone: Zone;
  monthsLeft: number;
  totalRefundAmount: number;
  currentPeriodEndTime: Date | string;
  canEndImmediately: boolean;
  canExtendPermit: boolean;
  maxExtensionMonthCount: number;
  hasPendingExtensionRequest: boolean;
  hasRefund: boolean;
  monthlyPrice: number;
  canBeRefunded: boolean;
  canEndAfterCurrentPeriod: boolean;
  vehicleChanged: boolean;
  addressChanged: boolean;
  isOrderConfirmed: boolean;
  address: UserAddress;
  addressApartment: string;
  addressApartmentSv: string;
};

export type Vehicle = {
  id: string;
  emission: number;
  isLowEmission: boolean;
  manufacturer: string;
  model: string;
  productionYear: number;
  registrationNumber: string;
  updatedFromTraficomOn: MaybeDate;
  restrictions: Array<string>;
};

export type TalpaOrder = {
  checkoutUrl?: string;
};

export interface PermitPriceChangeItem {
  product: string;
  previousPrice: number;
  newPrice: number;
  priceChange: number;
  priceChangeVat: number;
  startDate: MaybeDate;
  endDate: MaybeDate;
  monthCount: number;
}

export interface PermitPriceChanges {
  permit?: Pick<Permit, 'id' | 'vehicle'>;
  vehicle?: Vehicle;
  priceChanges: PermitPriceChangeItem[];
}

export interface ExtendedPriceListItem {
  price: number;
  netPrice: number;
  vatPrice: number;
  vat: number;
  startDate: MaybeDate;
  endDate: MaybeDate;
}
