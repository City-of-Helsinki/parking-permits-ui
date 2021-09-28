import axios, { AxiosResponse } from 'axios';
import { sumBy } from 'lodash';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';
import {
  Permit,
  TalpaItem,
  TalpaOrder,
  UserAddress,
  UserProfile,
} from '../types';

const creator = actionCreatorFactory('talpa');
export const talpaAction = creator.async<
  Record<string, unknown>,
  TalpaOrder,
  Error
>('create-oder');

const CONFIG = {
  orderURL: String(process.env.REACT_APP_TALPA_ORDER_EXPERIENCE_API),
};

export const purchasePermit =
  (user: UserProfile, address: UserAddress, permits: Permit[]) =>
  async (
    dispatch: ThunkDispatch<
      Record<string, unknown>,
      Record<string, unknown>,
      AnyAction
    >
  ): Promise<void> => {
    dispatch(talpaAction.started({}));
    const { orderURL } = CONFIG;
    const customer = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    /* TODO: Right now we send order for only one permit
     * Update this once talpa fixes to handle multiple
     * items with same product id but different meta
     * */
    const items: TalpaItem[] = [permits[0]].map(permit => {
      const { monthCount } = permit;
      const { priceNet, priceVat, priceGross } = permit.prices;
      const rowPrices = {
        rowPriceNet: priceNet * monthCount,
        rowPriceVat: priceVat * monthCount,
        rowPriceTotal: priceGross * monthCount,
      };
      return {
        quantity: permit.monthCount,
        productId: address.zone?.sharedProductId as string,
        productName: `${address.zone?.name as string} (${
          permit?.vehicle.registrationNumber
        })`,
        unit: 'pcs',
        meta: [{ key: 'permitId', value: permit.id }],
        ...permit.prices,
        ...rowPrices,
      };
    });
    const data: TalpaOrder = {
      namespace: 'asukaspysakointi',
      user: user.id,
      priceNet: sumBy(items, 'rowPriceNet'),
      priceVat: sumBy(items, 'rowPriceVat'),
      priceTotal: sumBy(items, 'rowPriceTotal'),
      items,
      customer,
    };
    try {
      const orderRes: AxiosResponse<TalpaOrder> = await axios.post(
        orderURL,
        data
      );
      dispatch(
        talpaAction.done({
          params: {},
          result: orderRes.data,
        })
      );
      const { checkoutUrl, user: userId } = orderRes.data;
      window.open(`${checkoutUrl}?user=${userId}`, '_self');
    } catch (err) {
      dispatch(
        talpaAction.failed({
          error: new Error("Can't create an order"),
          params: {},
        })
      );
    }
  };
