import { useEffect, useState } from 'react';

const REFRESH_INTERVAL_MS = 60_000;

const usePurchaseTime = (): [Date, (time: Date) => void] => {
  const [purchaseTime, setPurchaseTime] = useState(() => new Date());
  useEffect(() => {
    const refreshTime = () => setPurchaseTime(new Date());
    const timer = window.setInterval(refreshTime, REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refreshTime);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshTime);
    };
  }, []);
  return [purchaseTime, setPurchaseTime];
};

export default usePurchaseTime;
