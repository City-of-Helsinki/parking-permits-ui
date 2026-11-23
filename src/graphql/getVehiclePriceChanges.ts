import { gql } from '@apollo/client';

export default gql`
  query GetVehiclePriceChanges($permitId: ID!, $isLowEmission: Boolean!) {
    getVehiclePriceChanges(permitId: $permitId, isLowEmission: $isLowEmission) {
      product
      previousPrice
      newPrice
      priceChange
      priceChangeVat
      startDate
      endDate
      monthCount
    }
  }
`;
