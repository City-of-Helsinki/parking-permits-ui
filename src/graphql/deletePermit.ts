import { gql } from '@apollo/client';

export default gql`
  mutation Mutation($permitId: ID!) {
    deleteParkingPermit(permitId: $permitId)
  }
`;
