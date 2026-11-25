import { gql } from '@apollo/client';

export default gql`
  query Query {
    getPermits {
      id
      talpaOrderId
      receiptUrl
      checkoutUrl
      updateCardUrl
      subscriptionId
      startType
      startTime
      endTime
      endType
      primaryVehicle
      consentLowEmissionAccepted
      status
      contractType
      monthCount
      monthsLeft
      currentPeriodEndTime
      isInRenewalPeriod
      changesAvailableFrom
      canBeRefunded
      canEndImmediately
      canEndAfterCurrentPeriod
      canExtendPermit
      maxExtensionMonthCount
      hasPendingExtensionRequest
      endingRefundLines {
        product
        previousPrice
        newPrice
        priceChange
        priceChangeVat
        startDate
        endDate
        monthCount
      }
      totalRefundAmount
      hasRefund
      vehicleChanged
      addressChanged
      isOrderConfirmed
      addressApartment
      addressApartmentSv
      activeTemporaryVehicle {
        id
        startTime
        endTime
        isActive
        vehicle {
          model
          manufacturer
          registrationNumber
          updatedFromTraficomOn
          restrictions
        }
      }
      vehicle {
        id
        model
        isLowEmission
        manufacturer
        productionYear
        registrationNumber
        updatedFromTraficomOn
        restrictions
      }
      address {
        id
        streetName
        streetNumber
        streetNameSv
        city
        citySv
        postalCode
        location
        primary
        zone {
          id
          name
          description
          descriptionSv
          location
        }
      }
      parkingZone {
        id
        name
        description
        descriptionSv
        location
      }
      products {
        name
        vat
        endDate
        startDate
        unitPrice
        basePrice
        discountPrice
        totalPrice
        quantity
        lowEmissionDiscount
      }
    }
  }
`;
