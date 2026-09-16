import { gql } from '@apollo/client';

export default gql`
  mutation Mutation(
    $permitId: ID!
    $vehicleId: ID!
    $consentLowEmissionAccepted: Boolean
    $iban: String
  ) {
    updatePermitVehicle(
      permitId: $permitId
      vehicleId: $vehicleId
      consentLowEmissionAccepted: $consentLowEmissionAccepted
      iban: $iban
    ) {
      checkoutUrl
    }
  }
`;
