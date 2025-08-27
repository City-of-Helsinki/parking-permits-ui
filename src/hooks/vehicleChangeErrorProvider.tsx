import React, { Dispatch, SetStateAction } from 'react';

export type ErrorStateDict = {
  error: string;
  setError: Dispatch<SetStateAction<string>>;
};

// Undefined is used to get around initializing a Dispatch<SetStateAction<string>>-value
// without invoking useState() outside of component context which react doesn't allow.
// The actual value of the context is casted back to ErrorStateDict.
type VehicleChangeErrorContextDefaultValue = ErrorStateDict | undefined;
export const VehicleChangeErrorContext =
  React.createContext<VehicleChangeErrorContextDefaultValue>(undefined);
