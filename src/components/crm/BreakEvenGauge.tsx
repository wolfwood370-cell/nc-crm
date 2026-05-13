import { useCrm } from '@/store/useCrm';
import { formatEuro } from '@/types/crm';
import { PrivacyMask } from './PrivacyMask';

export const BreakEvenGauge = () => {
  const { financials, financialSummary } = useCrm();
  const { monthly_target } = financials;
  const current = financialSummary.gross_monthly;

  const safeTarget = Math.max(monthly_target, 1);
  const pct = Math.min(1, Math.max(0, current / safeTarget));
  const pctLabel = Math.round(pct * 100);

  // Semicircle path: r=80 → circumference of full circle = 2πr ≈ 502.4; semicircle ≈ 251.2
  const CIRC = 251.2;
  const dashOffset = CIRC - CIRC * pct;

  const targetLabel = monthly_target >= 1000
    ? `${(monthly_target / 1000).toFixed(monthly_target >= 10000 ? 0 : 1)}k`
    : `${Math.round(monthly_target)}`;

  return (
    <div className="bg-[#1a211d]/40 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-6 flex flex-col items-center relative overflow-hidden h-full">
      <h3 className="font-semibold text-lg text-[#dde4dd] w-full text-left mb-8">Avanzamento Mensile</h3>

      <div className="relative w-64 h-32 overflow-hidden mb-6">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <defs>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Base arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#2f3632"
            strokeLinecap="round"
            strokeWidth="20"
          />
          {/* Active arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#4edea3"
            strokeLinecap="round"
            strokeWidth="20"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 600ms ease' }}
          />
          {/* Glow */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#4edea3"
            strokeLinecap="round"
            strokeWidth="20"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            opacity="0.5"
            filter="url(#gaugeGlow)"
            style={{ transition: 'stroke-dashoffset 600ms ease' }}
          />
        </svg>
        <div className="absolute bottom-0 left-0 w-full flex justify-center items-end pb-2">
          <span className="text-4xl font-bold text-[#dde4dd] tabular-nums">{pctLabel}%</span>
        </div>
      </div>

      <div className="flex justify-between w-full text-sm text-[#bbcabf] px-8">
        <span><PrivacyMask>{formatEuro(current)}</PrivacyMask></span>
        <span>Obiettivo: <PrivacyMask>{targetLabel}</PrivacyMask></span>
      </div>
    </div>
  );
};
