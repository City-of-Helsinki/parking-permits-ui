import { gql } from '@apollo/client';

export default gql`
  mutation removeTemporaryVehicle($permitId: String!) {
    removeTemporaryVehicle(permitId: $permitId)
  }
`;
