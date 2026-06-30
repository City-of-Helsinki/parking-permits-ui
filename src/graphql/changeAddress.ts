import { gql } from '@apollo/client';

export default gql`
  mutation ChangeAddress($addressId: ID!, $iban: String) {
    changeAddress(addressId: $addressId, iban: $iban) {
      success
      checkoutUrl
    }
  }
`;
