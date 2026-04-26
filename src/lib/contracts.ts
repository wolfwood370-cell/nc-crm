import {
  ContractDurationMonths,
  ServiceType,
  SHORT_DURATION_SERVICES,
} from '@/types/crm';

export const parseCurrencyInput = (value: string): number | undefined => {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const computeContractEndDate = (
  startYmd: string,
  service: ServiceType | undefined,
  months: ContractDurationMonths,
): string | undefined => {
  if (!startYmd) return undefined;
  const [year, month, day] = startYmd.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  const end = new Date(Date.UTC(year, month - 1, day));
  if (service && SHORT_DURATION_SERVICES.includes(service)) {
    end.setUTCDate(end.getUTCDate() + 28);
  } else {
    // Add months while clamping the day so e.g. 31 Jan + 1m -> 28/29 Feb
    // (avoids JS overflow that would land on March 3rd).
    const targetMonth = end.getUTCMonth() + months;
    const targetYear = end.getUTCFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    const lastDayOfTarget = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
    const clampedDay = Math.min(day, lastDayOfTarget);
    end.setUTCFullYear(targetYear, normalizedMonth, clampedDay);
  }

  return `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, '0')}-${String(end.getUTCDate()).padStart(2, '0')}`;
};