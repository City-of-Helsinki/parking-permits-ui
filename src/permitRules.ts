const MAX_MONTHS = 12;

// Calendar month arithmetic must match the backend, regardless of browser timezone.
type PermitDates = {
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  contractType?: string;
  endType?: string | null;
};

function helsinkiDay(value: Date | string): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Helsinki',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));
  const part = (name: string) =>
    Number(parts.find(p => p.type === name)?.value);
  return new Date(Date.UTC(part('year'), part('month') - 1, part('day')));
}

export function permitEndDay(start: Date | string, months: number): Date {
  const date = helsinkiDay(start);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months + 1, 0)
  );
  return new Date(
    Date.UTC(
      lastDay.getUTCFullYear(),
      lastDay.getUTCMonth(),
      Math.min(date.getUTCDate(), lastDay.getUTCDate()) - 1
    )
  );
}

export function maxSecondaryMonths(
  primary: PermitDates,
  start: Date | string,
  now = new Date()
): number {
  if (
    primary.contractType === 'OPEN_ENDED' &&
    primary.endType !== 'AFTER_CURRENT_PERIOD'
  ) {
    return MAX_MONTHS;
  }
  if (!primary.endTime) {
    return 0;
  }
  const effectiveStart = new Date(
    Math.max(new Date(start).getTime(), now.getTime())
  );
  const end = helsinkiDay(primary.endTime);
  let months = 0;
  for (let n = 1; n <= MAX_MONTHS; n++) {
    if (permitEndDay(effectiveStart, n) <= end) {
      months = n;
    }
  }
  return months;
}

export function validSecondaryPurchase(
  primary: PermitDates,
  start: Date | string,
  months: number,
  now = new Date()
): boolean {
  if (!primary.startTime || new Date(start) < new Date(primary.startTime)) {
    return false;
  }
  if (!Number.isInteger(months) || months < 1) {
    return false;
  }
  return months <= maxSecondaryMonths(primary, start, now);
}
