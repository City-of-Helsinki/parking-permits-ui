import { gql } from '@apollo/client';

export default gql`
  mutation addTemporaryVehicle(
    $permitId: String!
    $registration: String!
    $startTime: String!
    $endTime: String!
  ) {
    addTemporaryVehicle(
      permitId: $permitId
      registration: $registration
      startTime: $startTime
      endTime: $endTime
    )
  }
`;
