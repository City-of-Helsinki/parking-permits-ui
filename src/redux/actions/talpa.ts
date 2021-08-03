import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import axios, { AxiosResponse } from 'axios';
import actionCreatorFactory from 'typescript-fsa';

import { Permit, TalpaCart, UserProfile } from '../types';

const creator = actionCreatorFactory('talpa');
export const talpaAction = creator.async<
  Record<string, unknown>,
  TalpaCart,
  Error
>('fetch');

const CONFIG = {
  cartURL: String(process.env.REACT_APP_TALPA_CART_EXPERIENCE_API),
  orderURL: String(process.env.REACT_APP_TALPA_ORDER_EXPERIENCE_API),
};

export const purchasePermit =
  (user: UserProfile, permits: Permit[]) =>
  async (
    dispatch: ThunkDispatch<
      Record<string, unknown>,
      Record<string, unknown>,
      AnyAction
    >
  ): Promise<void> => {
    dispatch(talpaAction.started({}));
    const { cartURL, orderURL } = CONFIG;
    if (!cartURL?.length || !orderURL?.length) {
      dispatch(
        talpaAction.failed({
          error: new Error(
            'Please provide both TALPA_CART_EXPERIENCE_API and TALPA_ORDER_EXPERIENCE_API'
          ),
          params: {},
        })
      );
      return;
    }
    const data: TalpaCart = {
      namespace: 'asukaspysakointi',
      user: user.id,
      items: permits.map(permit => ({
        quantity: permit.duration as number,
        productId: permit.vehicle.id,
      })),
    };
    try {
      const cartRes: AxiosResponse<TalpaCart> = await axios.post(cartURL, data);
      const { cartId } = cartRes.data;
      const orderRes: AxiosResponse<TalpaCart> = await axios.post(
        orderURL + cartId,
        {
          customer: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        }
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
