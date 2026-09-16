import { gql } from '@apollo/client';

export default gql`
  mutation Mutation {
    createOrder {
      checkoutUrl
    }
  }
`;
