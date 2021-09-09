import axios, { AxiosResponse } from 'axios';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';
import { Permit, TalpaOrder, UserAddress, UserProfile } from '../types';

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
    if (!orderURL?.length) {
      dispatch(
        talpaAction.failed({
          error: new Error('Please provide TALPA_ORDER_EXPERIENCE_API'),
          params: {},
        })
      );
      return;
    }
    // TODO: Replace this logic
    const data: TalpaOrder = {
      namespace: 'asukaspysakointi',
      user: user.id,
      priceNet: '30',
      priceVat: '12',
      priceTotal: '42',
      items: permits.map(permit => ({
        quantity: permit.contract.monthCount,
        productId: address.zone?.sharedProductId as string,
        productName: address.zone?.name as string,
        unit: 'pcs',
        // eslint-disable-next-line no-magic-numbers
        rowPriceNet: (permit.price.offer * 0.76).toString(),
        // eslint-disable-next-line no-magic-numbers
        rowPriceVat: (permit.price.offer * 0.24).toString(),
        rowPriceTotal: permit.price.offer.toString(),
        vatPercentage: '24',
        // eslint-disable-next-line no-magic-numbers
        priceNet: (permit.price.offer * 0.76).toString(),
        // eslint-disable-next-line no-magic-numbers
        priceVat: (permit.price.offer * 0.24).toString(),
        priceGross: permit.price.offer.toString(),
        meta: [{ key: 'permitId', value: permit.id }],
      })),
      customer: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phoneNumber || '+358440210054',
      },
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
    } catch (err) {
      dispatch(
        talpaAction.failed({
          error: new Error("Can't create an order"),
          params: {},
        })
      );
    }
  };
