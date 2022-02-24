import { ParkingContractType, ParkingStartType, PermitStatus } from './enums';
import { Zone } from './user';

export interface Product {
  vat: number;
  quantity: number;
  endDate: string;
  startDate: string;
  unitPrice: number;
  totalPrice: number;
  lowEmissionDiscount: number;
}

export type Permit = {
  id: string;
  orderId: string;
  subscriptionId: string;
  startType?: ParkingStartType;
  startTime?: Date | string;
  endTime?: Date | string | null;
  status: PermitStatus;
  primaryVehicle: boolean;
  consentLowEmissionAccepted: boolean;
  vehicle: Vehicle;
  products: Product[];
  contractType: ParkingContractType;
  monthCount: number;
  parkingZone: Zone;
  monthsLeft: number;
  currentPeriodEndTime: Date | string;
  canEndImmediately: boolean;
  hasRefund: boolean;
  refundAmount?: number;
  monthlyPrice: number;
  canEndAfterCurrentPeriod: boolean;
};

export type Vehicle = {
  id: string;
  emission: number;
  isLowEmission: boolean;
  powerType: string;
  manufacturer: string;
  model: string;
  productionYear: number;
  registrationNumber: string;
};

export type TalpaOrder = {
  checkoutUrl?: string;
};
