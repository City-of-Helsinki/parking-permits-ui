import { gql } from '@apollo/client';

export default gql`
  mutation endParkingPermit(
    $permitIds: [String]!
    $endType: PermitEndType!
    $iban: String
  ) {
    endParkingPermit(permitIds: $permitIds, endType: $endType, iban: $iban)
  }
`;
