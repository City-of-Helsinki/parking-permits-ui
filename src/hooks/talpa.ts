import axios from 'axios';
import { sumBy } from 'lodash';
import {
  ParkingContractType,
  Permit,
  TalpaItem,
  TalpaOrder,
  UserAddress,
  UserProfile,
} from '../types';

const CONFIG = {
  orderURL: String(process.env.REACT_APP_TALPA_ORDER_EXPERIENCE_API),
};

const proceedToOrderPayment = (
  user: UserProfile,
  address: UserAddress,
  permits: Permit[]
): Promise<TalpaOrder> => {
  const { orderURL } = CONFIG;
  const customer = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
  const items: TalpaItem[] = permits.map(permit => {
    const { monthCount } = permit;
    const openEndedFields = {
      periodUnit: 'monthly',
      periodFrequency: '1',
    };
    return {
      quantity:
        permit.contractType === ParkingContractType.OPEN_ENDED ? 1 : monthCount,
      productId: address.zone?.sharedProductId as string,
      productName: `${address.zone?.name as string} (${
        permit?.vehicle.registrationNumber
      })`,
      unit: 'pcs',
      meta: [{ key: 'permitId', value: permit.id }],
      ...permit.prices,
      ...(permit.contractType === ParkingContractType.OPEN_ENDED
        ? openEndedFields
        : {}),
    };
  });
  const data: TalpaOrder = {
    namespace: 'asukaspysakointi',
    user: user.id,
    priceNet: sumBy(items, 'priceNet'),
    priceVat: sumBy(items, 'priceVat'),
    priceTotal: sumBy(items, 'priceGross'),
    items,
    customer,
  };
  return axios.post(orderURL, data).then(orderRes => orderRes.data);
};

export default proceedToOrderPayment;
