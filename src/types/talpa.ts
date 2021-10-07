export type TalpaItem = {
  productId?: string;
  productName: string;
  quantity: number;
  unit: string;
  rowPriceNet: number;
  rowPriceVat: number;
  rowPriceTotal: number;
  startDate?: string;
  periodFrequency?: string;
  periodUnit?: string;
  vatPercentage: number;
  priceNet: number;
  priceVat: number;
  priceGross: number;
  meta: TalpaMeta[];
};

export type TalpaCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type TalpaMeta = {
  key: string;
  value: string;
  label?: string;
  ordinal?: number;
  visibleInCheckout?: boolean;
};

export type TalpaOrder = {
  namespace: string;
  user: string;
  priceNet: number;
  priceVat: number;
  priceTotal: number;
  checkoutUrl?: string;
  items?: TalpaItem[];
  customer: TalpaCustomer;
};
