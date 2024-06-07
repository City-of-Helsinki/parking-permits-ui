import { ReportCallback } from 'web-vitals';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const reportWebVitals = (onPerfEntry?: ReportCallback) => {
  if (onPerfEntry) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
