import { gql } from '@apollo/client';

export default gql`
  mutation Mutation($registration: String!) {
    getVehicleInformation(registration: $registration) {
      id
      model
      emission
      isLowEmission
      manufacturer
      productionYear
      registrationNumber
      updatedFromTraficomOn
      restrictions
    }
  }
`;
