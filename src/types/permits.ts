import { ParkingContractType, ParkingStartType, PermitStatus } from './enums';
import { Zone } from './user';

export interface Price {
  priceNet: number;
  priceVat: number;
  priceGross: number;
  vatPercentage: number;
  rowPriceNet: number;
  rowPriceVat: number;
  rowPriceTotal: number;
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
  prices: Price;
  contractType: ParkingContractType;
  monthCount: number;
  parkingZone: Zone;
  monthsLeft: number;
  currentPeriodEndTime: Date | string;
  canEndImmediately: boolean;
  hasRefund: boolean;
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
