import { act, renderHook } from '@testing-library/react';
import { useContext } from 'react';
import {
  VehicleChangeErrorContext,
  VehicleChangeErrorProvider,
} from '../vehicleChangeErrorProvider';

describe('VehicleChangeErrorProvider', () => {
  it('provides an empty error by default and updates it via setError', () => {
    const { result } = renderHook(() => useContext(VehicleChangeErrorContext), {
      wrapper: VehicleChangeErrorProvider,
    });
    expect(result.current?.error).toBe('');

    act(() => result.current?.setError('Test error'));
    expect(result.current?.error).toBe('Test error');

    act(() => result.current?.setError(''));
    expect(result.current?.error).toBe('');
  });

  it('keeps the context value stable while the error is unchanged', () => {
    const { result, rerender } = renderHook(
      () => useContext(VehicleChangeErrorContext),
      { wrapper: VehicleChangeErrorProvider }
    );
    const initial = result.current;

    rerender();
    expect(result.current).toBe(initial);

    act(() => result.current?.setError('Test error'));
    expect(result.current).not.toBe(initial);
  });

  it('has no context value outside the provider', () => {
    const { result } = renderHook(() => useContext(VehicleChangeErrorContext));
    expect(result.current).toBeUndefined();
  });
});
