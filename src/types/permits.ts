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
};

export type VehicleType = {
  id: string;
  type: string;
};

export type Vehicle = {
  id: string;
  emission: number;
  isLowEmission: boolean;
  vehicleType: VehicleType;
  manufacturer: string;
  model: string;
  productionYear: number;
  registrationNumber: string;
};
