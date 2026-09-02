import { gql } from '@apollo/client';

export default gql`
  mutation ExtendParkingPermit($permitId: ID!, $monthCount: Int) {
    extendParkingPermit(permitId: $permitId, monthCount: $monthCount) {
      checkoutUrl
    }
  }
`;
