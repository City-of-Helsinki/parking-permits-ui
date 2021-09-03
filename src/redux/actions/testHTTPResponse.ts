import { v4 as uuidv4 } from 'uuid';

import { ParkingDurationType, ParkingStartType, Permit } from '../types';

const getPermit = (reg: string, toyota?: boolean): Permit => ({
  id: '12342-ABC',
  vehicle: {
    id: uuidv4(),
    type: 'B1',
    manufacturer: toyota ? 'Toyota' : 'Skoda',
    model: toyota ? 'CH-R' : 'Octavia',
    // eslint-disable-next-line no-magic-numbers
    productionYear: toyota ? 2018 : 2020,
    registrationNumber: reg,
    // eslint-disable-next-line no-magic-numbers
    emission: toyota ? 85 : 110,
    primary: !!toyota,
  },
  prices: {
    // eslint-disable-next-line no-magic-numbers
    original: 30,
    // eslint-disable-next-line no-magic-numbers
    offer: 15,
    currency: '€',
  },
  durationType: ParkingDurationType.OPEN_ENDED,
  startType: ParkingStartType.IMMEDIATELY,
  startDate: new Date(),
  duration: 1,
});

export default getPermit;
