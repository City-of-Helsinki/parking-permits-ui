import { gql } from '@apollo/client';

export default gql`
  query getExtendedPriceList($permitId: ID!, $monthCount: Int!) {
    getExtendedPriceList(permitId: $permitId, monthCount: $monthCount) {
      startDate
      endDate
      vat
      price
      netPrice
      vatPrice
    }
  }
`;
